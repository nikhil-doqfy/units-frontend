import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { EMPTY, catchError, of, switchMap, tap } from 'rxjs';

import {
  ReportColumn,
  ReportTableComponent,
} from '../component/report-table/report-table.component';
import {
  DateRange,
  DateRangePickerComponent,
} from '../component/date-range-picker/date-range-picker.component';
import { FinanceEmptyStateComponent } from '../component/finance-empty-state/finance-empty-state.component';
import { FinanceReportsService } from '../../../services/finance-reports.service';
import { unwrapFinanceEnvelope } from '../finance-envelope';
import { FinanceActivationState } from '../finance-activation.resolver';
import {
  fromIsoDate,
  getCurrentMonthRange,
  toIsoDate,
} from '../finance-date-range';

interface TrialBalanceAccount {
  id: number;
  name: string;
  account_type: string;
  total_debit: number;
  total_credit: number;
}

interface TrialBalanceContent {
  pmc_id: string;
  start_date: string;
  end_date: string;
  accounts: TrialBalanceAccount[];
  balanced: boolean;
}

/**
 * Story 2.2: Trial Balance page, the first real consumer of Story 2.1's
 * shared `report-table`/`date-range-picker`. Mirrors Overview's reactive
 * `paramMap` subscription pattern (Story 1.4) and `getCurrentMonthRange`/
 * `toIsoDate` helpers for the default date range.
 *
 * Report calls only fire when `financeActivation === 'activated'` (spec
 * Boundaries & Constraints): for the other two states,
 * `FinanceEmptyStateComponent` renders instead and no fetch happens.
 *
 * `balanced` is read directly from the API response and never recomputed
 * (spec Boundaries & Constraints/Design Notes) -- the totals row is a
 * page-local sum of the response's own `total_debit`/`total_credit` values
 * for display only.
 */
@Component({
  selector: 'app-trial-balance',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReportTableComponent,
    DateRangePickerComponent,
    FinanceEmptyStateComponent,
  ],
  templateUrl: './trial-balance.component.html',
})
export class TrialBalanceComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private financeReportsService = inject(FinanceReportsService);
  private destroyRef = inject(DestroyRef);

  pmcId = '';
  financeActivation: FinanceActivationState = 'not_activated';

  columns: ReportColumn[] = [
    { key: 'name', label: 'Account' },
    { key: 'account_type', label: 'Type' },
    { key: 'total_debit', label: 'Debit', align: 'end' },
    { key: 'total_credit', label: 'Credit', align: 'end' },
  ];

  rows: Record<string, string | number>[] = [];
  totals: Record<string, string | number> | undefined;
  balanced = true;

  loading = false;
  loadFailed = false;

  dateRangeControl = new FormControl<DateRange>(
    { from: null, to: null },
    { nonNullable: true },
  );

  ngOnInit(): void {
    // Read params/data reactively, not from a one-time snapshot: Angular's
    // default RouteReuseStrategy reuses this component instance when only
    // `:pmcId` changes, so a snapshot-only read would keep showing the
    // previous PMC's data (mirrors Overview, Story 1.4).
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.pmcId = params.get('pmcId') ?? '';
        this.financeActivation = this.route.snapshot.data[
          'financeActivation'
        ] as FinanceActivationState;

        this.rows = [];
        this.totals = undefined;
        this.balanced = true;
        this.loadFailed = false;

        if (this.financeActivation === 'activated' && this.pmcId) {
          const range = getCurrentMonthRange();
          this.dateRangeControl.setValue(
            {
              from: fromIsoDate(range.startDate),
              to: fromIsoDate(range.endDate),
            },
            { emitEvent: false },
          );
          this.fetchTrialBalance(range.startDate, range.endDate);
        }
      });

    // switchMap so a fast-changing date range never lets a slower, stale
    // request overwrite a newer one's result -- only the latest request's
    // response is ever applied. One subscription for the component's whole
    // lifetime, not re-registered per fetch.
    this.dateRangeControl.valueChanges
      .pipe(
        switchMap((range) => {
          if (
            this.financeActivation !== 'activated' ||
            !this.pmcId ||
            !range?.from ||
            !range?.to
          ) {
            return EMPTY;
          }
          return this.doFetchTrialBalance(
            toIsoDate(range.from),
            toIsoDate(range.to),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private fetchTrialBalance(startDate: string, endDate: string): void {
    this.doFetchTrialBalance(startDate, endDate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  private doFetchTrialBalance(startDate: string, endDate: string) {
    this.loading = true;
    this.loadFailed = false;

    return this.financeReportsService
      .getTrialBalance(this.pmcId, startDate, endDate)
      .pipe(
        tap((resp) => {
          this.loading = false;
          const content = unwrapFinanceEnvelope<TrialBalanceContent>(resp);
          this.applyContent(content);
        }),
        catchError(() => {
          this.loading = false;
          this.loadFailed = true;
          this.rows = [];
          this.totals = undefined;
          this.balanced = true;
          return of(null);
        }),
      );
  }

  private applyContent(content: TrialBalanceContent): void {
    const accounts = content?.accounts ?? [];
    this.rows = accounts.map((account) => ({
      id: account.id,
      name: account.name,
      account_type: account.account_type,
      total_debit: account.total_debit,
      total_credit: account.total_credit,
    }));

    const totalDebit = accounts.reduce(
      (sum, account) => sum + Number(account.total_debit ?? 0),
      0,
    );
    const totalCredit = accounts.reduce(
      (sum, account) => sum + Number(account.total_credit ?? 0),
      0,
    );

    this.totals = {
      name: 'Total',
      account_type: '',
      total_debit: totalDebit,
      total_credit: totalCredit,
    };

    // `balanced` is read directly from the API -- never recomputed from the
    // page-local sum above (spec Boundaries & Constraints).
    this.balanced = content?.balanced ?? true;
  }

  // Navigation is a route event, resolved entirely by the destination
  // page's own route -- never a direct `FinanceLedgerService` injection
  // across pages (AD-8 cross-service drill-through rule, spec Always).
  onRowClick(row: Record<string, string | number>): void {
    this.router.navigate([
      '/dashboard/finance',
      this.pmcId,
      'ledger-detail',
      row['id'],
    ]);
  }
}
