import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { EMPTY, Subject, catchError, of, switchMap, tap } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import {
  ReportColumn,
  ReportTableComponent,
} from '../component/report-table/report-table.component';
import {
  DateRange,
  DateRangePickerComponent,
} from '../component/date-range-picker/date-range-picker.component';
import { FinanceEmptyStateComponent } from '../component/finance-empty-state/finance-empty-state.component';
import { FinanceLedgerService } from '../../../services/finance-ledger.service';
import { unwrapFinanceEnvelope } from '../finance-envelope';
import { FinanceActivationState } from '../finance-activation.resolver';
import {
  fromIsoDate,
  getCurrentMonthRange,
  toIsoDate,
} from '../finance-date-range';
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../../shared/model/shared.model';
import { SharedService } from '../../../../shared.service';
import { WhiteCardComponent } from '../../../../shared/component/white-card/white-card.component';

// Decimal-serialized as strings by the backend, matching Trial Balance's
// total_debit/total_credit and Chart of Accounts' balance fields from the
// same service -- never a native number on the wire (Story 4.1 post-review
// fix, do not repeat that mistake here).
interface LedgerLineRow {
  ledger_line_id: number;
  journal_entry_id: number;
  posted_at: string;
  source_lease_transaction_id: number;
  source_status_transition: string;
  debit: string;
  credit: string;
  running_balance: string;
  reversed_journal_entry_id: number | null;
  reversing_entry_ids: number[];
}

/**
 * Story 4.3: a plain-text, non-interactive reversal reference -- never a
 * click-through/jump-to-row, since the linked entry isn't guaranteed to be
 * on the current page, within the current date range, or (in principle) the
 * same Account (spec Design Notes). Both fields come directly off the
 * backend response as-is, never recomputed client-side.
 */
/**
 * `source_status_transition` is a free-form, dynamically-built string on
 * the backend (e.g. `CREATE-BALANCE`, `BALANCE-BOUNCED`,
 * `BOUNCE_FEE-FOR-6`, `COMMISSION-SPLIT`) -- there's no fixed enum to map
 * against a lookup table, so this only reformats the existing value
 * (underscores/hyphens -> spaces, sentence case) rather than guessing at a
 * translated meaning for every possible transition the backend can emit.
 * Paired with the source transaction id so the reference isn't just a bare,
 * meaningless number (spec: readability for the portal user).
 */
function formatSourceReference(
  line: LedgerLineRow,
  translate: TranslateService,
): string {
  const transition = (line.source_status_transition ?? '')
    .replace(/[-_]+/g, ' ')
    .trim()
    .toLowerCase();
  const label = transition
    ? transition.charAt(0).toUpperCase() + transition.slice(1)
    : translate.instant('FINANCE_TRANSACTION');

  return `${label} (Txn #${line.source_lease_transaction_id})`;
}

function buildReversalNote(
  line: LedgerLineRow,
  translate: TranslateService,
): string {
  const notes: string[] = [];

  if (line.reversed_journal_entry_id != null) {
    notes.push(
      `${translate.instant('FINANCE_REVERSES_ENTRY')} #${line.reversed_journal_entry_id}`,
    );
  }

  if (line.reversing_entry_ids?.length) {
    const ids = line.reversing_entry_ids.map((id) => `#${id}`).join(', ');
    notes.push(`${translate.instant('FINANCE_REVERSED_BY_ENTRY')} ${ids}`);
  }

  return notes.join('; ');
}

interface AccountLedgerLinesContent {
  pmc_id: string;
  account_id: number;
  account_name: string;
  account_type: string;
  start_date: string;
  end_date: string;
  account_balance: string;
  lines: LedgerLineRow[];
}

/**
 * Story 4.2: Ledger Detail page, reached by clicking an Account row from
 * Chart of Accounts (Story 4.1) or Trial Balance (Story 2.2). Mirrors Trial
 * Balance's reactive `paramMap` + `switchMap`-guarded date-range-fetch
 * pattern, and Ageing's pagination pattern, for a single Account's
 * `GET accounts/<pk>/ledger-lines`.
 *
 * `account_balance` and each row's `running_balance` are rendered exactly
 * as the backend returns them -- this page never recomputes or overrides
 * them (spec Boundaries & Constraints, FR14/NFR1).
 *
 * Story 4.3: each row also carries a plain-text, non-interactive reversal
 * reference (`buildReversalNote`) -- deliberately not a click-through/
 * jump-to-row, since the linked entry isn't guaranteed to be on the same
 * page/date-range/Account.
 */
@Component({
  selector: 'app-ledger-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReportTableComponent,
    DateRangePickerComponent,
    FinanceEmptyStateComponent,
    WhiteCardComponent,
    TranslateModule,
  ],
  templateUrl: './ledger-detail.component.html',
})
export class LedgerDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private financeLedgerService = inject(FinanceLedgerService);
  private sharedService = inject(SharedService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  pmcId = '';
  accountId = '';
  financeActivation: FinanceActivationState = 'not_activated';
  breadcrumbData: BreadCrumb[] = [];

  // Set by the `?from=` query param the originating page's row-click
  // navigation passes (Trial Balance or Chart of Accounts) -- picks the
  // correct parent breadcrumb crumb without a cross-page service injection
  // (AD-8). Defaults to Chart of Accounts when absent (direct navigation,
  // deep link, or refresh).
  private origin: 'trial-balance' | 'chart-of-accounts' = 'chart-of-accounts';

  // componentName-matching guard convention (see all-leads.component.ts,
  // mirrored by ageing.component.ts) -- report-table forwards this to
  // table-pagination unchanged; onPageChange below checks it before acting.
  componentName = 'ledgerDetailComponent';

  accountName = '';
  accountType = '';
  accountBalance: string | number = '';

  columns: ReportColumn[] = [
    { key: 'posted_at', label: 'FINANCE_COL_DATE', type: 'date' },
    { key: 'source_reference', label: 'FINANCE_COL_SOURCE_REFERENCE' },
    { key: 'debit', label: 'FINANCE_COL_DEBIT', align: 'end' },
    { key: 'credit', label: 'FINANCE_COL_CREDIT', align: 'end' },
    {
      key: 'running_balance',
      label: 'FINANCE_COL_RUNNING_BALANCE',
      align: 'end',
    },
    { key: 'reversal_note', label: 'FINANCE_COL_REVERSAL' },
  ];

  rows: Record<string, string | number>[] = [];

  currentPage = 1;
  totalRecords = 0;
  rowsPerPage = 25;

  loading = false;
  loadFailed = false;

  dateRangeControl = new FormControl<DateRange>(
    { from: null, to: null },
    { nonNullable: true },
  );

  // Drives every fetch (initial mount, date-range change, and page change)
  // through one switchMap pipeline so a stale in-flight request can never
  // overwrite a newer one's result (mirrors Trial Balance's date-range
  // pipeline and Ageing's fetchTrigger).
  private fetchTrigger = new Subject<void>();

  ngOnInit(): void {
    // Subscribed before `paramMap` below: `fetchTrigger` is a plain Subject
    // (not a BehaviorSubject), so a `.next()` call with no subscriber yet
    // listening is silently dropped. `paramMap` emits synchronously on
    // subscribe (the current route params are already known), and its
    // handler below calls `fetchTrigger.next()` on that very first
    // synchronous emission -- if this pipeline were wired up afterward
    // (as it originally was), that first fetch would be lost and the page
    // would render empty until the user changed the date range or page,
    // which is what finally set up a listener in time.
    this.fetchTrigger
      .pipe(
        switchMap(() => {
          const range = this.dateRangeControl.value;
          if (
            this.financeActivation !== 'activated' ||
            !this.pmcId ||
            !this.accountId ||
            !range?.from ||
            !range?.to
          ) {
            return EMPTY;
          }
          return this.doFetchLedgerLines(
            toIsoDate(range.from),
            toIsoDate(range.to),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    this.dateRangeControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.currentPage = 1;
        this.fetchTrigger.next();
      });

    // Read params/data reactively, not from a one-time snapshot: Angular's
    // default RouteReuseStrategy reuses this component instance when only
    // `:pmcId`/`:accountId` changes, so a snapshot-only read would keep
    // showing the previous Account's data (mirrors Trial Balance, Story
    // 2.2).
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.pmcId = params.get('pmcId') ?? '';
        this.accountId = params.get('accountId') ?? '';
        this.financeActivation = this.route.snapshot.data[
          'financeActivation'
        ] as FinanceActivationState;
        this.origin =
          this.route.snapshot.queryParamMap.get('from') === 'trial-balance'
            ? 'trial-balance'
            : 'chart-of-accounts';

        this.rows = [];
        this.currentPage = 1;
        this.totalRecords = 0;
        this.accountName = '';
        this.accountType = '';
        this.accountBalance = '';
        this.loadFailed = false;
        this.loadBreadcrumb();

        if (
          this.financeActivation === 'activated' &&
          this.pmcId &&
          this.accountId
        ) {
          const range = getCurrentMonthRange();
          this.dateRangeControl.setValue(
            {
              from: fromIsoDate(range.startDate),
              to: fromIsoDate(range.endDate),
            },
            { emitEvent: false },
          );
          this.fetchTrigger.next();
        }
      });
  }

  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.fetchTrigger.next();
  }

  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.fetchTrigger.next();
  }

  private loadBreadcrumb(): void {
    const parentCrumb =
      this.origin === 'trial-balance'
        ? {
            label: 'FINANCE_TRIAL_BALANCE',
            link: `/dashboard/finance/${this.pmcId}/trial-balance`,
          }
        : {
            label: 'FINANCE_CHART_OF_ACCOUNTS',
            link: `/dashboard/finance/${this.pmcId}/chart-of-accounts`,
          };

    // `accountName` is real API data, never a translation key -- only the
    // fallback (no account name loaded yet) is. `getBreadcrumbs` pipes
    // every label through `translate.get()`, which safely no-ops back to
    // the identity string for a real account name that isn't a key.
    this.sharedService
      .getBreadcrumbs([
        { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
        { label: 'PAGE_TITLE.FINANCE', link: `/dashboard/finance/${this.pmcId}/overview` },
        parentCrumb,
        { label: this.accountName || 'FINANCE_LEDGER_DETAIL', link: '' },
      ])
      .subscribe((data) => (this.breadcrumbData = data));
  }

  private doFetchLedgerLines(startDate: string, endDate: string) {
    this.loading = true;
    this.loadFailed = false;

    return this.financeLedgerService
      .getAccountLedgerLines(
        this.pmcId,
        Number(this.accountId),
        startDate,
        endDate,
        this.currentPage,
        this.rowsPerPage,
      )
      .pipe(
        tap((resp) => {
          this.loading = false;
          const content =
            unwrapFinanceEnvelope<AccountLedgerLinesContent>(resp);
          this.applyContent(content, resp?.pagination);
        }),
        catchError(() => {
          this.loading = false;
          this.loadFailed = true;
          this.rows = [];
          this.totalRecords = 0;
          this.accountName = '';
          this.accountType = '';
          this.accountBalance = '';
          return of(null);
        }),
      );
  }

  private applyContent(
    content: AccountLedgerLinesContent,
    pagination: any,
  ): void {
    this.accountName = content?.account_name ?? '';
    this.accountType = content?.account_type ?? '';
    this.accountBalance = content?.account_balance ?? '';
    this.loadBreadcrumb();

    const lines = content?.lines ?? [];
    this.rows = lines.map((line) => ({
      posted_at: line.posted_at,
      source_reference: formatSourceReference(line, this.translate),
      debit: line.debit,
      credit: line.credit,
      running_balance: line.running_balance,
      reversal_note: buildReversalNote(line, this.translate),
    }));

    this.totalRecords = pagination?.total_records ?? this.rows.length;
  }
}
