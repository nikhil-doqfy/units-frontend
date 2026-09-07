import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { WhiteCardComponent } from '../../../../../shared/component/white-card/white-card.component';

interface FinanceNavLink {
  labelKey: string;
  segment: string;
}

/**
 * Shared tab strip shown on every `:pmcId`-scoped Finance page. Before this
 * component, none of the 7 report/workspace pages (Trial Balance, P&L,
 * Balance Sheet, Ageing, Chart of Accounts, Reconciliation) were reachable
 * from the UI at all -- only Overview, via the sidebar's single Finance
 * link. Ledger Detail is deliberately excluded: it takes an `:accountId`
 * this strip has no value for, and is reached by clicking an account row
 * on Chart of Accounts instead.
 */
@Component({
  selector: 'app-finance-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    TranslateModule,
    WhiteCardComponent,
  ],
  templateUrl: './finance-nav.component.html',
  styleUrl: './finance-nav.component.css',
})
export class FinanceNavComponent {
  @Input({ required: true }) pmcId!: string;

  readonly links: FinanceNavLink[] = [
    { labelKey: 'FINANCE_OVERVIEW', segment: 'overview' },
    { labelKey: 'FINANCE_TRIAL_BALANCE', segment: 'trial-balance' },
    { labelKey: 'FINANCE_PROFIT_LOSS', segment: 'profit-loss' },
    { labelKey: 'FINANCE_BALANCE_SHEET', segment: 'balance-sheet' },
    { labelKey: 'FINANCE_AGEING', segment: 'ageing' },
    { labelKey: 'FINANCE_CHART_OF_ACCOUNTS', segment: 'chart-of-accounts' },
    { labelKey: 'FINANCE_RECONCILIATION', segment: 'reconciliation' },
  ];
}
