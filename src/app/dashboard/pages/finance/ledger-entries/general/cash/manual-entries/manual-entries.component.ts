import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of, tap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import {
  ReportColumn,
  ReportTableComponent,
} from '../../../../component/report-table/report-table.component';
import {
  DateRange,
  DateRangePickerComponent,
} from '../../../../component/date-range-picker/date-range-picker.component';
import { FinanceEmptyStateComponent } from '../../../../component/finance-empty-state/finance-empty-state.component';
import { FinanceNavComponent } from '../../../../component/finance-nav/finance-nav.component';
import { WhiteCardComponent } from '../../../../../../../shared/component/white-card/white-card.component';
import { FinanceLedgerService } from '../../../../../../services/finance-ledger.service';
import { unwrapFinanceEnvelope } from '../../../../finance-envelope';
import { FinanceActivationState } from '../../../../finance-activation.resolver';
import { SharedService } from '../../../../../../../shared.service';
import { BreadCrumb } from '../../../../../../../shared/model/shared.model';
import { ManualEntryModalComponent } from './manual-entry-modal/manual-entry-modal.component';

interface ManualEntryLineRow {
  account_id: number;
  account_name: string;
  debit: string;
  credit: string;
}

interface ManualEntryRow {
  id: number;
  posted_at: string;
  memo: string;
  lines: ManualEntryLineRow[];
}

interface ManualEntriesListContent {
  pmc_id: string;
  entries: ManualEntryRow[];
}

interface ChartOfAccountsRow {
  id: number;
  name: string;
  account_type: string;
  balance: string;
}

interface ChartOfAccountsContent {
  pmc_id: string;
  accounts: ChartOfAccountsRow[];
}

/** One flattened row rendered by `app-report-table`, one per entry line. */
interface ManualEntryTableRow {
  id: number;
  posted_at: string;
  memo: string;
  account_id: number;
  account_name: string;
  debit: string;
  credit: string;
}

/**
 * Story 5.1: Manual Entries page (FR-16), reached via
 * Ledger Entries -> General -> Cash -> Manual Entries. Mirrors
 * `ChartOfAccountsComponent`'s reactive `paramMap` subscription pattern
 * and `financeActivation` gating (Code Map): the account picker sources
 * from `getChartOfAccounts`, and a dynamic debit/credit line-row form
 * mirrors the spec's example payload shape
 * (`{pmc_id, memo, lines: [{account_id, debit, credit}, ...]}`).
 *
 * Spec 5.1b: the add-entry form itself now lives in
 * `ManualEntryModalComponent`, opened via `NgbModal` (matching
 * `all-leads.component.ts`'s `ScheduleMeetingModalComponent` pattern) --
 * this component keeps only the fetched `rows`/`accounts` plus a
 * client-side date-range + account filter over the already-fetched list
 * (spec Boundaries & Constraints: no new query params, no new fetch).
 */
@Component({
  selector: 'app-manual-entries',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReportTableComponent,
    DateRangePickerComponent,
    FinanceEmptyStateComponent,
    FinanceNavComponent,
    WhiteCardComponent,
    TranslateModule,
  ],
  templateUrl: './manual-entries.component.html',
})
export class ManualEntriesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private financeLedgerService = inject(FinanceLedgerService);
  private sharedService = inject(SharedService);
  private modalService = inject(NgbModal);
  private destroyRef = inject(DestroyRef);

  pmcId = '';
  financeActivation: FinanceActivationState = 'not_activated';
  breadcrumbData: BreadCrumb[] = [];

  columns: ReportColumn[] = [
    { key: 'posted_at', label: 'FINANCE_COL_POSTED_AT', type: 'date' },
    { key: 'memo', label: 'FINANCE_COL_MEMO' },
    { key: 'account_name', label: 'FINANCE_COL_ACCOUNT' },
    { key: 'debit', label: 'FINANCE_COL_DEBIT', align: 'end' },
    { key: 'credit', label: 'FINANCE_COL_CREDIT', align: 'end' },
  ];

  /** Full list as fetched from the backend, one row per entry line. */
  private entryRows: ManualEntryTableRow[] = [];

  /** Result of applying `dateRangeControl`/`accountFilter` over `entryRows`. */
  rows: Record<string, string | number>[] = [];

  accounts: ChartOfAccountsRow[] = [];

  loading = false;
  loadFailed = false;

  // Client-side only (spec Boundaries & Constraints: "its all front end
  // change only") -- neither control triggers a new fetch, both just
  // re-derive `rows` from the already-fetched `entryRows`.
  dateRangeControl = new FormControl<DateRange>(
    { from: null, to: null },
    { nonNullable: true },
  );
  accountFilter = new FormControl<number | null>(null);

  ngOnInit(): void {
    this.dateRangeControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyFilters());

    this.accountFilter.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyFilters());

    // Reactive, not snapshot-only: Angular's default RouteReuseStrategy
    // reuses this component instance when only `:pmcId` changes (mirrors
    // Chart of Accounts, Story 2.2).
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.pmcId = params.get('pmcId') ?? '';
        this.financeActivation = this.route.snapshot.data[
          'financeActivation'
        ] as FinanceActivationState;
        this.loadBreadcrumb();

        this.entryRows = [];
        this.rows = [];
        this.accounts = [];
        this.loadFailed = false;
        this.dateRangeControl.setValue(
          { from: null, to: null },
          { emitEvent: false },
        );
        this.accountFilter.setValue(null, { emitEvent: false });

        if (this.financeActivation === 'activated' && this.pmcId) {
          this.fetchAccounts();
          this.fetchManualEntries();
        }
      });
  }

  private loadBreadcrumb(): void {
    this.sharedService
      .getBreadcrumbs([
        { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
        { label: 'PAGE_TITLE.FINANCE', link: `/dashboard/finance/${this.pmcId}/overview` },
        { label: 'FINANCE_LEDGER_ENTRIES', link: '' },
        { label: 'FINANCE_MANUAL_ENTRIES', link: '' },
      ])
      .subscribe((data) => (this.breadcrumbData = data));
  }

  private fetchAccounts(): void {
    this.financeLedgerService
      .getChartOfAccounts(this.pmcId)
      .pipe(
        tap((resp) => {
          const content = unwrapFinanceEnvelope<ChartOfAccountsContent>(resp);
          this.accounts = content?.accounts ?? [];
        }),
        catchError(() => {
          this.accounts = [];
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private fetchManualEntries(): void {
    this.loading = true;
    this.loadFailed = false;

    this.financeLedgerService
      .getManualJournalEntries(this.pmcId)
      .pipe(
        tap((resp) => {
          this.loading = false;
          const content = unwrapFinanceEnvelope<ManualEntriesListContent>(resp);
          this.applyContent(content);
        }),
        catchError(() => {
          this.loading = false;
          this.loadFailed = true;
          this.entryRows = [];
          this.rows = [];
          // Post-review patch: without this, an active filter would keep
          // showing selected UI state against zero rows with no indication
          // the failure -- not the filter -- is why the table is empty.
          this.dateRangeControl.setValue(
            { from: null, to: null },
            { emitEvent: false },
          );
          this.accountFilter.setValue(null, { emitEvent: false });
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private applyContent(content: ManualEntriesListContent): void {
    const entries = content?.entries ?? [];
    this.entryRows = entries.flatMap((entry) =>
      entry.lines.map((line) => ({
        id: entry.id,
        posted_at: entry.posted_at,
        memo: entry.memo,
        account_id: line.account_id,
        account_name: line.account_name,
        debit: line.debit,
        credit: line.credit,
      })),
    );
    this.applyFilters();
  }

  /**
   * Client-side date-range (inclusive) + account filter over the
   * already-fetched `entryRows` (spec Boundaries & Constraints) -- an
   * entry matches the account filter if *any* of its lines uses the
   * selected account (spec Design Notes), so the whole original entry
   * (all its flattened line rows sharing the same `id`) is kept or
   * dropped as a unit.
   */
  private applyFilters(): void {
    const range = this.dateRangeControl.value;
    const accountId = this.accountFilter.value;

    const matchingIds =
      accountId == null
        ? null
        : new Set(
            this.entryRows
              .filter((row) => row.account_id === accountId)
              .map((row) => row.id),
          );

    const from = range?.from ? this.startOfDay(range.from) : null;
    const to = range?.to ? this.endOfDay(range.to) : null;

    // Post-review patch: an inverted range (from > to) would otherwise
    // silently produce a nonsensical empty result -- matches the backend's
    // own inverted-range rejection convention (ledger/views.py's
    // start_date > end_date check), applied here client-side since this
    // page has no server round-trip to reject it on.
    if (from && to && from > to) {
      this.rows = [];
      return;
    }

    this.rows = this.entryRows
      .filter((row) => {
        if (matchingIds && !matchingIds.has(row.id)) return false;

        if (from || to) {
          const postedAt = new Date(row.posted_at);
          if (from && postedAt < from) return false;
          if (to && postedAt > to) return false;
        }

        return true;
      })
      .map((row) => ({
        id: row.id,
        posted_at: row.posted_at,
        memo: row.memo,
        account_name: row.account_name,
        debit: row.debit,
        credit: row.credit,
      }));
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  }

  private endOfDay(date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999,
    );
  }

  openAddEntryModal(): void {
    const modalRef = this.modalService.open(ManualEntryModalComponent, {
      ariaLabelledBy: 'modal-title',
      windowClass: 'mdlCommon',
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.pmcId = this.pmcId;
    modalRef.componentInstance.accounts = this.accounts;
    modalRef.result.then(
      (result) => {
        if (result === true) {
          this.fetchManualEntries();
        }
      },
      () => {},
    );
  }
}
