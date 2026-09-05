import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import {
  ReportColumn,
  ReportTableComponent,
} from '../component/report-table/report-table.component';
import { FinanceEmptyStateComponent } from '../component/finance-empty-state/finance-empty-state.component';
import { FinanceNavComponent } from '../component/finance-nav/finance-nav.component';
import { FinanceLedgerService } from '../../../services/finance-ledger.service';
import { unwrapFinanceEnvelope } from '../finance-envelope';
import { FinanceActivationState } from '../finance-activation.resolver';
import { SharedService } from '../../../../shared.service';
import { BreadCrumb } from '../../../../shared/model/shared.model';

interface ChartOfAccountsRow {
  id: number;
  name: string;
  account_type: string;
  // Decimal-serialized as a string by the backend, matching Trial
  // Balance's total_debit/total_credit and Balance Sheet's balance fields
  // from the same service -- never a native number on the wire.
  balance: string;
}

interface ChartOfAccountsContent {
  pmc_id: string;
  accounts: ChartOfAccountsRow[];
}

/**
 * Story 4.1: Chart of Accounts page -- a read-only reference view of a
 * PMC's seeded accounting structure, independent of any single report.
 * Mirrors Trial Balance's reactive `paramMap` subscription pattern (Story
 * 2.2) and Finance's shared `report-table`/`finance-empty-state` components.
 *
 * The fetch only fires when `financeActivation === 'activated'` (spec
 * Boundaries & Constraints): for the other two states,
 * `FinanceEmptyStateComponent` renders instead and no fetch happens.
 *
 * This story codes against `GET accounts/`, a backend contract AD-6
 * commits to but has not shipped yet -- the call is expected to 404 today,
 * and `loadFailed` is expected to render honestly in that case (spec
 * Boundaries & Constraints: no fabricated/mocked rows).
 */
@Component({
  selector: 'app-chart-of-accounts',
  standalone: true,
  imports: [
    CommonModule,
    ReportTableComponent,
    FinanceEmptyStateComponent,
    FinanceNavComponent,
    TranslateModule,
  ],
  templateUrl: './chart-of-accounts.component.html',
})
export class ChartOfAccountsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private financeLedgerService = inject(FinanceLedgerService);
  private sharedService = inject(SharedService);
  private destroyRef = inject(DestroyRef);

  pmcId = '';
  financeActivation: FinanceActivationState = 'not_activated';
  breadcrumbData: BreadCrumb[] = [];

  columns: ReportColumn[] = [
    { key: 'name', label: 'FINANCE_COL_NAME' },
    { key: 'account_type', label: 'FINANCE_COL_TYPE' },
    { key: 'balance', label: 'FINANCE_COL_BALANCE', align: 'end' },
  ];

  rows: Record<string, string | number>[] = [];

  loading = false;
  loadFailed = false;

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
        this.loadBreadcrumb();

        this.rows = [];
        this.loadFailed = false;

        if (this.financeActivation === 'activated' && this.pmcId) {
          this.fetchChartOfAccounts();
        }
      });
  }

  private loadBreadcrumb(): void {
    this.sharedService
      .getBreadcrumbs([
        { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
        { label: 'PAGE_TITLE.FINANCE', link: `/dashboard/finance/${this.pmcId}/overview` },
        { label: 'FINANCE_CHART_OF_ACCOUNTS', link: '' },
      ])
      .subscribe((data) => (this.breadcrumbData = data));
  }

  private fetchChartOfAccounts(): void {
    this.loading = true;
    this.loadFailed = false;

    this.financeLedgerService
      .getChartOfAccounts(this.pmcId)
      .pipe(
        tap((resp) => {
          this.loading = false;
          const content = unwrapFinanceEnvelope<ChartOfAccountsContent>(resp);
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

  private applyContent(content: ChartOfAccountsContent): void {
    const accounts = content?.accounts ?? [];
    this.rows = accounts.map((account) => ({
      id: account.id,
      name: account.name,
      account_type: account.account_type,
      balance: account.balance,
    }));
  }

  // Navigation is a route event, resolved entirely by the destination
  // page's own route -- never a direct `FinanceLedgerService` injection
  // across pages (AD-8 cross-service drill-through rule, spec Always).
  onRowClick(row: Record<string, string | number>): void {
    this.router.navigate(
      ['/dashboard/finance', this.pmcId, 'ledger-detail', row['id']],
      { queryParams: { from: 'chart-of-accounts' } },
    );
  }
}
