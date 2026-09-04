import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { EMPTY, Subject, catchError, of, switchMap, tap } from 'rxjs';

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
import { PageChange } from '../../../../shared/model/shared.model';

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
  // Story 4.3's scope -- carried on the response but never rendered in this
  // story (spec Never list).
  reversed_journal_entry_id: number | null;
  reversing_entry_ids: number[];
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
  ],
  templateUrl: './ledger-detail.component.html',
})
export class LedgerDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private financeLedgerService = inject(FinanceLedgerService);
  private destroyRef = inject(DestroyRef);

  pmcId = '';
  accountId = '';
  financeActivation: FinanceActivationState = 'not_activated';

  // componentName-matching guard convention (see all-leads.component.ts,
  // mirrored by ageing.component.ts) -- report-table forwards this to
  // table-pagination unchanged; onPageChange below checks it before acting.
  componentName = 'ledgerDetailComponent';

  accountName = '';
  accountType = '';
  accountBalance: string | number = '';

  columns: ReportColumn[] = [
    { key: 'posted_at', label: 'Date' },
    { key: 'source_lease_transaction_id', label: 'Source Reference' },
    { key: 'debit', label: 'Debit', align: 'end' },
    { key: 'credit', label: 'Credit', align: 'end' },
    { key: 'running_balance', label: 'Running Balance', align: 'end' },
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

        this.rows = [];
        this.currentPage = 1;
        this.totalRecords = 0;
        this.accountName = '';
        this.accountType = '';
        this.accountBalance = '';
        this.loadFailed = false;

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

    // switchMap so a fast-changing date range (or page change) never lets a
    // slower, stale request overwrite a newer one's result -- only the
    // latest request's response is ever applied (mirrors Trial Balance).
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
  }

  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.fetchTrigger.next();
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

    const lines = content?.lines ?? [];
    this.rows = lines.map((line) => ({
      posted_at: line.posted_at,
      source_lease_transaction_id: line.source_lease_transaction_id,
      debit: line.debit,
      credit: line.credit,
      running_balance: line.running_balance,
    }));

    this.totalRecords = pagination?.total_records ?? this.rows.length;
  }
}
