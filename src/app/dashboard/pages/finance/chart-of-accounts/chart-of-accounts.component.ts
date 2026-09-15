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
  // Story 5.3 (FR-18): sub-category under account_type (e.g. Current
  // Asset, Liability). Null for accounts with no subtype (Income/Expense
  // accounts, or a pre-existing row left uncategorized by the Story 5.3
  // migration) -- rendered as a dash, never fabricated.
  account_subtype: string | null;
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
    { key: 'account_subtype', label: 'FINANCE_COL_CATEGORY' },
    { key: 'balance', label: 'FINANCE_COL_BALANCE', align: 'end' },
  ];

  // Story 5.3 (FR-18): human-readable labels for the Category column,
  // matching Account.ACCOUNT_SUBTYPE_CHOICES' backend display names
  // exactly (ledger/models.py) -- a plain lookup, not a translation-pipe
  // key, since `report-table` renders row values with no per-cell
  // translation step (spec Code Map: "translated label" means a real
  // display string, not a raw enum code).
  private static readonly ACCOUNT_SUBTYPE_LABELS: Record<string, string> = {
    FIXED_ASSET: 'Fixed Asset',
    CURRENT_ASSET: 'Current Asset',
    OTHER_CURRENT_ASSET: 'Other Current Asset',
    LIABILITY: 'Liability',
    CAPITAL_CONTRIBUTION: 'Capital Contribution',
    SHARE_CAPITAL: 'Share Capital',
  };

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
      account_subtype: this.formatAccountSubtype(account.account_subtype),
      balance: account.balance,
    }));
  }

  // Blank/dash for null (Income/Expense accounts, or a pre-existing row
  // left uncategorized by the Story 5.3 migration) -- never a fabricated
  // guess (spec Always).
  private formatAccountSubtype(accountSubtype: string | null): string {
    if (!accountSubtype) {
      return '—';
    }
    return (
      ChartOfAccountsComponent.ACCOUNT_SUBTYPE_LABELS[accountSubtype] ?? accountSubtype
    );
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
