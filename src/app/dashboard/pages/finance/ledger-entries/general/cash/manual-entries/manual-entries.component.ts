import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError, of, tap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import {
  ReportColumn,
  ReportTableComponent,
} from '../../../../component/report-table/report-table.component';
import { FinanceEmptyStateComponent } from '../../../../component/finance-empty-state/finance-empty-state.component';
import { FinanceNavComponent } from '../../../../component/finance-nav/finance-nav.component';
import { WhiteCardComponent } from '../../../../../../../shared/component/white-card/white-card.component';
import { FinanceLedgerService } from '../../../../../../services/finance-ledger.service';
import { unwrapFinanceEnvelope } from '../../../../finance-envelope';
import { FinanceActivationState } from '../../../../finance-activation.resolver';
import { SharedService } from '../../../../../../../shared.service';
import { BreadCrumb } from '../../../../../../../shared/model/shared.model';

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

/** One editable debit/credit line row in the add-entry form. */
interface FormLine {
  account_id: number | null;
  debit: string;
  credit: string;
}

function emptyFormLine(): FormLine {
  return { account_id: null, debit: '0.00', credit: '0.00' };
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
 * Client-side balance validation mirrors the backend's own check
 * (sum(debits) == sum(credits)) before ever calling the API -- the backend
 * remains the sole source of truth (its own 400 is still surfaced via the
 * global http.interceptor.ts on any mismatch it independently detects),
 * but this avoids a needless round-trip for the common typo case.
 */
@Component({
  selector: 'app-manual-entries',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReportTableComponent,
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

  rows: Record<string, string | number>[] = [];
  accounts: ChartOfAccountsRow[] = [];

  loading = false;
  loadFailed = false;

  memo = '';
  formLines: FormLine[] = [emptyFormLine(), emptyFormLine()];
  submitting = false;
  balanceError: string | null = null;

  ngOnInit(): void {
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

        this.rows = [];
        this.accounts = [];
        this.loadFailed = false;
        this.resetForm();

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
          this.rows = [];
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private applyContent(content: ManualEntriesListContent): void {
    const entries = content?.entries ?? [];
    this.rows = entries.flatMap((entry) =>
      entry.lines.map((line) => ({
        id: entry.id,
        posted_at: entry.posted_at,
        memo: entry.memo,
        account_name: line.account_name,
        debit: line.debit,
        credit: line.credit,
      })),
    );
  }

  addLine(): void {
    this.formLines.push(emptyFormLine());
  }

  removeLine(index: number): void {
    if (this.formLines.length <= 2) return;
    this.formLines.splice(index, 1);
  }

  private resetForm(): void {
    this.memo = '';
    this.formLines = [emptyFormLine(), emptyFormLine()];
    this.balanceError = null;
    this.submitting = false;
  }

  private computeTotals(): { debit: number; credit: number } {
    return this.formLines.reduce(
      (totals, line) => ({
        debit: totals.debit + (Number(line.debit) || 0),
        credit: totals.credit + (Number(line.credit) || 0),
      }),
      { debit: 0, credit: 0 },
    );
  }

  submit(): void {
    if (this.submitting || !this.pmcId) return;

    this.balanceError = null;

    const withAccount = this.formLines.filter(
      (line) => line.account_id !== null,
    );
    if (withAccount.length < 2) {
      this.balanceError = 'FINANCE_MANUAL_ENTRY_MIN_LINES';
      return;
    }

    // Client-side mirror of the backend's own balance check (spec
    // Boundaries & Constraints) -- avoids a round-trip for the common
    // typo case; the backend remains the sole source of truth.
    const totals = this.computeTotals();
    if (totals.debit.toFixed(2) !== totals.credit.toFixed(2)) {
      this.balanceError = 'FINANCE_MANUAL_ENTRY_UNBALANCED';
      return;
    }

    this.submitting = true;

    const lines = withAccount.map((line) => ({
      account_id: line.account_id as number,
      debit: (Number(line.debit) || 0).toFixed(2),
      credit: (Number(line.credit) || 0).toFixed(2),
    }));

    this.financeLedgerService
      .createManualJournalEntry(this.pmcId, lines, this.memo)
      .pipe(
        tap(() => {
          this.submitting = false;
          this.resetForm();
          this.fetchManualEntries();
        }),
        catchError(() => {
          // No inline error message here: the global http.interceptor.ts
          // already toasts the backend's exact `error.message` for any
          // non-2xx response (mirrors BankStatementUploadComponent's
          // established convention) -- surfacing it a second time inline
          // would show the identical text twice.
          this.submitting = false;
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
