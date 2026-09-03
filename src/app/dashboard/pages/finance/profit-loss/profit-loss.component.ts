import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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

interface ProfitLossAccount {
  id: number;
  name: string;
  account_type: string;
  total_debit: number;
  total_credit: number;
  contribution: number;
}

interface ProfitLossContent {
  pmc_id: string;
  start_date: string;
  end_date: string;
  income_accounts: ProfitLossAccount[];
  expense_accounts: ProfitLossAccount[];
  net_profit_loss: number;
}

/**
 * Story 2.3: Profit & Loss page, mirroring Trial Balance's page structure
 * (Story 2.2) exactly -- same route-guard pair, same reactive
 * `paramMap`/`switchMap` fetch pattern, same shared date-range picker and
 * empty-state component -- but rendering two separate `report-table`
 * instances (Income, Expense) since `getProfitLoss()`'s response already
 * separates `income_accounts`/`expense_accounts`.
 *
 * Report calls only fire when `financeActivation === 'activated'` (spec
 * Boundaries & Constraints): for the other two states,
 * `FinanceEmptyStateComponent` renders instead and no fetch happens.
 *
 * `net_profit_loss` is read directly from the API response and never
 * recomputed as `sum(Income) − sum(Expense)` (spec Boundaries &
 * Constraints).
 */
/**
 * Story 2.3: Profit & Loss page, mirroring Trial Balance's page structure
 * (Story 2.2) exactly -- same route-guard pair, same reactive
 * `paramMap`/`switchMap` fetch pattern, same shared date-range picker and
 * empty-state component -- but rendering two separate `report-table`
 * instances (Income, Expense) since `getProfitLoss()`'s response already
 * separates `income_accounts`/`expense_accounts`.
 *
 * Report calls only fire when `financeActivation === 'activated'` (spec
 * Boundaries & Constraints): for the other two states,
 * `FinanceEmptyStateComponent` renders instead and no fetch happens.
 *
 * `net_profit_loss` is read directly from the API response and never
 * recomputed as `sum(Income) − sum(Expense)` (spec Boundaries &
 * Constraints).
 */
@Component({
  selector: 'app-profit-loss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReportTableComponent,
    DateRangePickerComponent,
    FinanceEmptyStateComponent,
  ],
  templateUrl: './profit-loss.component.html',
})
export class ProfitLossComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private financeReportsService = inject(FinanceReportsService);
  private destroyRef = inject(DestroyRef);

  pmcId = '';
  financeActivation: FinanceActivationState = 'not_activated';

  columns: ReportColumn[] = [
    { key: 'name', label: 'Account' },
    { key: 'account_type', label: 'Type' },
    { key: 'total_debit', label: 'Debit', align: 'end' },
    { key: 'total_credit', label: 'Credit', align: 'end' },
    { key: 'contribution', label: 'Contribution', align: 'end' },
  ];

  incomeRows: Record<string, string | number>[] = [];
  expenseRows: Record<string, string | number>[] = [];
  netProfitLoss = 0;

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
    // previous PMC's data (mirrors Trial Balance, Story 2.2).
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.pmcId = params.get('pmcId') ?? '';
        this.financeActivation = this.route.snapshot.data[
          'financeActivation'
        ] as FinanceActivationState;

        this.incomeRows = [];
        this.expenseRows = [];
        this.netProfitLoss = 0;
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
          this.fetchProfitLoss(range.startDate, range.endDate);
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
          return this.doFetchProfitLoss(
            toIsoDate(range.from),
            toIsoDate(range.to),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private fetchProfitLoss(startDate: string, endDate: string): void {
    this.doFetchProfitLoss(startDate, endDate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  private doFetchProfitLoss(startDate: string, endDate: string) {
    this.loading = true;
    this.loadFailed = false;

    return this.financeReportsService
      .getProfitLoss(this.pmcId, startDate, endDate)
      .pipe(
        tap((resp) => {
          this.loading = false;
          const content = unwrapFinanceEnvelope<ProfitLossContent>(resp);
          this.applyContent(content);
        }),
        catchError(() => {
          this.loading = false;
          this.loadFailed = true;
          this.incomeRows = [];
          this.expenseRows = [];
          this.netProfitLoss = 0;
          return of(null);
        }),
      );
  }

  private applyContent(content: ProfitLossContent): void {
    const incomeAccounts = content?.income_accounts ?? [];
    const expenseAccounts = content?.expense_accounts ?? [];

    this.incomeRows = incomeAccounts.map((account) => ({
      name: account.name,
      account_type: account.account_type,
      total_debit: account.total_debit,
      total_credit: account.total_credit,
      contribution: account.contribution,
    }));

    this.expenseRows = expenseAccounts.map((account) => ({
      name: account.name,
      account_type: account.account_type,
      total_debit: account.total_debit,
      total_credit: account.total_credit,
      contribution: account.contribution,
    }));

    // `net_profit_loss` is read directly from the API -- never recomputed
    // as sum(Income) − sum(Expense) (spec Boundaries & Constraints).
    this.netProfitLoss = content?.net_profit_loss ?? 0;
  }
}
