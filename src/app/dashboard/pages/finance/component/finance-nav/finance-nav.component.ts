import { Component, effect, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { WhiteCardComponent } from '../../../../../shared/component/white-card/white-card.component';
import { SelectedPmcService } from '../../../../services/selected-pmc.service';

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
 *
 * Story 5.1 (FR-16) adds "Ledger Entries", landing on
 * Ledger Entries -> General -> Cash -> Manual Entries -- this strip still
 * has no dropdown/tree support (Design Notes), so the new entry is one
 * more flat tab whose `segment` happens to be a multi-segment path,
 * exactly like every other entry here structurally, just deeper. Do not
 * build a generic multi-level nav framework speculatively for this story
 * (spec Never) -- Story 5.7 will need its own slot under
 * "Ledger Entries -> General" too, but that is out of scope here.
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

  private router = inject(Router);
  private selectedPmcService = inject(SelectedPmcService);
  private isFirstNavbarPmcChange = true;

  constructor() {
    // The navbar's PMC selector now drives Finance's PMC switching (the
    // in-page dropdown that used to live on the Overview page is gone).
    // Every Finance page includes this component, so this is the one
    // place that needs to react: on change, re-navigate to the same
    // report/page the user is currently on, just under the new :pmcId.
    // Skips the first (synchronous, effect-creation-time) run -- that
    // fires before `pmcId` has even been set from the route yet.
    effect(() => {
      const pmc = this.selectedPmcService.selectedPmc();
      if (this.isFirstNavbarPmcChange) {
        this.isFirstNavbarPmcChange = false;
        return;
      }
      if (!pmc || pmc.key === this.pmcId) return;

      const currentSegment = this.router.url
        .replace(/^\/dashboard\/finance\/[^/]+\//, '')
        .split('?')[0];
      this.router.navigate([
        '/dashboard/finance',
        pmc.key,
        ...currentSegment.split('/'),
      ]);
    });
  }

  readonly links: FinanceNavLink[] = [
    { labelKey: 'FINANCE_OVERVIEW', segment: 'overview' },
    { labelKey: 'FINANCE_TRIAL_BALANCE', segment: 'trial-balance' },
    { labelKey: 'FINANCE_PROFIT_LOSS', segment: 'profit-loss' },
    { labelKey: 'FINANCE_BALANCE_SHEET', segment: 'balance-sheet' },
    { labelKey: 'FINANCE_AGEING', segment: 'ageing' },
    { labelKey: 'FINANCE_CHART_OF_ACCOUNTS', segment: 'chart-of-accounts' },
    { labelKey: 'FINANCE_RECONCILIATION', segment: 'reconciliation' },
    {
      labelKey: 'FINANCE_LEDGER_ENTRIES',
      segment: 'ledger/general/cash/manual-entries',
    },
    // Story 5.2 (FR-17): PMC Charge Types settings page -- a new flat tab,
    // same as every other entry here (Design Notes: not a general PMC
    // profile editor, so it lives beside the report tabs, not nested under
    // Ledger Entries).
    { labelKey: 'FINANCE_PMC_CHARGE_TYPES', segment: 'pmc-charge-types' },
  ];

  // A `link.segment` may itself contain multiple path segments (e.g.
  // Story 5.1's 'ledger/general/cash/manual-entries') -- the template
  // needs one array entry per real segment, not a single entry containing
  // literal slashes (which `[routerLink]` would otherwise URL-encode as
  // `%2F`, breaking navigation). Every existing single-segment link
  // (e.g. 'overview') round-trips through `split('/')` unchanged.
  routeCommands(pmcId: string, segment: string): (string | null)[] {
    return ['/dashboard/finance', pmcId, ...segment.split('/')];
  }
}
