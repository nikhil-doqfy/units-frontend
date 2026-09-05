import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { EMPTY, catchError, of, switchMap, tap } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import {
  ReportColumn,
  ReportTableComponent,
} from '../component/report-table/report-table.component';
import { AsOfDatePickerComponent } from '../component/as-of-date-picker/as-of-date-picker.component';
import { FinanceEmptyStateComponent } from '../component/finance-empty-state/finance-empty-state.component';
import { FinanceNavComponent } from '../component/finance-nav/finance-nav.component';
import { FinanceReportsService } from '../../../services/finance-reports.service';
import { unwrapFinanceEnvelope } from '../finance-envelope';
import { FinanceActivationState } from '../finance-activation.resolver';
import { toIsoDate } from '../finance-date-range';
import { SharedService } from '../../../../shared.service';
import { BreadCrumb } from '../../../../shared/model/shared.model';
import { WhiteCardComponent } from '../../../../shared/component/white-card/white-card.component';

interface BalanceSheetAccount {
  id: number;
  name: string;
  account_type: string;
  total_debit: number;
  total_credit: number;
  balance: number;
}

interface BalanceSheetEquity {
  name: string;
  balance: number;
}

interface BalanceSheetContent {
  asset_accounts: BalanceSheetAccount[];
  liability_accounts: BalanceSheetAccount[];
  equity: BalanceSheetEquity;
  balanced: boolean;
}

/**
 * Story 2.4: Balance Sheet page, mirroring Profit & Loss's page structure
 * (Story 2.3) -- same route-guard pair, same reactive `paramMap`/`switchMap`
 * fetch pattern, same `FinanceEmptyStateComponent` gating -- but using
 * `app-as-of-date-picker` (a single point-in-time date, Story 2.1) instead
 * of the date-range picker, since a Balance Sheet is inherently point-in-time
 * (spec Approach).
 *
 * Report calls only fire when `financeActivation === 'activated'` (spec
 * Boundaries & Constraints): for the other two states,
 * `FinanceEmptyStateComponent` renders instead and no fetch happens.
 *
 * Assets and Liabilities each render in their own `report-table` (mirrors
 * P&L's Income/Expense split). Equity is a single derived line
 * (`{name, balance}`), rendered as a plain display line rather than forced
 * through `report-table` (spec Design Notes). `balanced` is read directly
 * from the API and never recomputed client-side (spec Boundaries &
 * Constraints).
 */
@Component({
  selector: 'app-balance-sheet',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReportTableComponent,
    AsOfDatePickerComponent,
    FinanceEmptyStateComponent,
    FinanceNavComponent,
    WhiteCardComponent,
    TranslateModule,
  ],
  templateUrl: './balance-sheet.component.html',
})
export class BalanceSheetComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private financeReportsService = inject(FinanceReportsService);
  private sharedService = inject(SharedService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  pmcId = '';
  financeActivation: FinanceActivationState = 'not_activated';
  breadcrumbData: BreadCrumb[] = [];

  columns: ReportColumn[] = [
    { key: 'name', label: 'FINANCE_COL_ACCOUNT' },
    { key: 'account_type', label: 'FINANCE_COL_TYPE' },
    { key: 'total_debit', label: 'FINANCE_COL_DEBIT', align: 'end' },
    { key: 'total_credit', label: 'FINANCE_COL_CREDIT', align: 'end' },
    { key: 'balance', label: 'FINANCE_COL_BALANCE', align: 'end' },
  ];

  assetRows: Record<string, string | number>[] = [];
  liabilityRows: Record<string, string | number>[] = [];
  equityName = '';
  equityBalance = 0;
  balanced = true;

  loading = false;
  loadFailed = false;

  asOfDateControl = new FormControl<Date | null>(null, {
    nonNullable: false,
  });

  ngOnInit(): void {
    // Read params/data reactively, not from a one-time snapshot: Angular's
    // default RouteReuseStrategy reuses this component instance when only
    // `:pmcId` changes, so a snapshot-only read would keep showing the
    // previous PMC's data (mirrors Trial Balance/P&L).
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.pmcId = params.get('pmcId') ?? '';
        this.financeActivation = this.route.snapshot.data[
          'financeActivation'
        ] as FinanceActivationState;
        this.loadBreadcrumb();

        this.assetRows = [];
        this.liabilityRows = [];
        this.equityName = '';
        this.equityBalance = 0;
        this.balanced = true;
        this.loadFailed = false;

        if (this.financeActivation === 'activated' && this.pmcId) {
          const today = new Date();
          this.asOfDateControl.setValue(today, { emitEvent: false });
          this.fetchBalanceSheet(toIsoDate(today));
        }
      });

    // switchMap so a fast-changing as-of-date never lets a slower, stale
    // request overwrite a newer one's result -- only the latest request's
    // response is ever applied. One subscription for the component's whole
    // lifetime, not re-registered per fetch.
    this.asOfDateControl.valueChanges
      .pipe(
        switchMap((date) => {
          if (this.financeActivation !== 'activated' || !this.pmcId || !date) {
            return EMPTY;
          }
          return this.doFetchBalanceSheet(toIsoDate(date));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private loadBreadcrumb(): void {
    this.sharedService
      .getBreadcrumbs([
        { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
        { label: 'PAGE_TITLE.FINANCE', link: `/dashboard/finance/${this.pmcId}/overview` },
        { label: 'FINANCE_BALANCE_SHEET', link: '' },
      ])
      .subscribe((data) => (this.breadcrumbData = data));
  }

  private fetchBalanceSheet(asOfDate: string): void {
    this.doFetchBalanceSheet(asOfDate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  private doFetchBalanceSheet(asOfDate: string) {
    this.loading = true;
    this.loadFailed = false;

    return this.financeReportsService
      .getBalanceSheet(this.pmcId, asOfDate)
      .pipe(
        tap((resp) => {
          this.loading = false;
          const content = unwrapFinanceEnvelope<BalanceSheetContent>(resp);
          this.applyContent(content);
        }),
        catchError(() => {
          this.loading = false;
          this.loadFailed = true;
          this.assetRows = [];
          this.liabilityRows = [];
          this.equityName = '';
          this.equityBalance = 0;
          this.balanced = true;
          return of(null);
        }),
      );
  }

  private applyContent(content: BalanceSheetContent): void {
    const assetAccounts = content?.asset_accounts ?? [];
    const liabilityAccounts = content?.liability_accounts ?? [];

    this.assetRows = assetAccounts.map((account) => ({
      name: account.name,
      account_type: account.account_type,
      total_debit: account.total_debit,
      total_credit: account.total_credit,
      balance: account.balance,
    }));

    this.liabilityRows = liabilityAccounts.map((account) => ({
      name: account.name,
      account_type: account.account_type,
      total_debit: account.total_debit,
      total_credit: account.total_credit,
      balance: account.balance,
    }));

    this.equityName =
      content?.equity?.name ??
      this.translate.instant('FINANCE_RETAINED_EARNINGS');
    this.equityBalance = content?.equity?.balance ?? 0;

    // `balanced` is read directly from the API -- never recomputed by
    // comparing Assets against Liabilities+Equity client-side (spec
    // Boundaries & Constraints).
    this.balanced = content?.balanced ?? true;
  }
}
