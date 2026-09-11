import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FinanceOverviewComponent } from './overview/finance-overview.component';
import { FinanceLandingComponent } from './landing/finance-landing.component';
import { TrialBalanceComponent } from './trial-balance/trial-balance.component';
import { ProfitLossComponent } from './profit-loss/profit-loss.component';
import { BalanceSheetComponent } from './balance-sheet/balance-sheet.component';
import { AgeingComponent } from './ageing/ageing.component';
import { ReconciliationComponent } from './reconciliation/reconciliation.component';
import { ChartOfAccountsComponent } from './chart-of-accounts/chart-of-accounts.component';
import { LedgerDetailComponent } from './ledger-detail/ledger-detail.component';
import { ManualEntriesComponent } from './ledger-entries/general/cash/manual-entries/manual-entries.component';
import { PmcChargeTypesComponent } from './pmc-charge-types/pmc-charge-types.component';
import { financeLandingGuard } from './finance-landing.guard';
import { financePmcReachableGuard } from './finance-pmc-reachable.guard';
import { financeReconciliationGuard } from './finance-reconciliation.guard';
import { financeActivationResolver } from './finance-activation.resolver';

// Every Finance route is shaped `dashboard/finance/:pmcId/<page>` — no
// Finance route omits the `:pmcId` segment. The `''` (no-`:pmcId`) route
// is handled entirely by `financeLandingGuard`'s redirect; it never
// renders `FinanceLandingComponent` unless there is zero reachable PMC.
const routes: Routes = [
  {
    path: '',
    component: FinanceLandingComponent,
    canActivate: [financeLandingGuard],
  },
  {
    path: ':pmcId/overview',
    component: FinanceOverviewComponent,
    canActivate: [financePmcReachableGuard],
    resolve: { financeActivation: financeActivationResolver },
  },
  {
    path: ':pmcId/trial-balance',
    component: TrialBalanceComponent,
    canActivate: [financePmcReachableGuard],
    resolve: { financeActivation: financeActivationResolver },
  },
  {
    path: ':pmcId/profit-loss',
    component: ProfitLossComponent,
    canActivate: [financePmcReachableGuard],
    resolve: { financeActivation: financeActivationResolver },
  },
  {
    path: ':pmcId/balance-sheet',
    component: BalanceSheetComponent,
    canActivate: [financePmcReachableGuard],
    resolve: { financeActivation: financeActivationResolver },
  },
  {
    path: ':pmcId/ageing',
    component: AgeingComponent,
    canActivate: [financePmcReachableGuard],
    resolve: { financeActivation: financeActivationResolver },
  },
  {
    path: ':pmcId/reconciliation',
    component: ReconciliationComponent,
    canActivate: [financePmcReachableGuard, financeReconciliationGuard],
    resolve: { financeActivation: financeActivationResolver },
  },
  {
    path: ':pmcId/chart-of-accounts',
    component: ChartOfAccountsComponent,
    canActivate: [financePmcReachableGuard],
    resolve: { financeActivation: financeActivationResolver },
  },
  {
    path: ':pmcId/ledger-detail/:accountId',
    component: LedgerDetailComponent,
    canActivate: [financePmcReachableGuard],
    resolve: { financeActivation: financeActivationResolver },
  },
  // Story 5.1 (FR-16): Ledger Entries -> General -> Cash -> Manual Entries.
  // The feedback's drill path is not four distinct pages yet (Design
  // Notes) -- "General" and "Cash" have no page of their own in this
  // story, so the nested URL segments are kept (matching the spec's
  // literal Code Map path) but resolve straight to the one page that
  // exists so far, Manual Entries. A sibling link next to it (e.g. under
  // General) can be added later without restructuring this route.
  {
    path: ':pmcId/ledger/general/cash/manual-entries',
    component: ManualEntriesComponent,
    canActivate: [financePmcReachableGuard],
    resolve: { financeActivation: financeActivationResolver },
  },
  // Story 5.2 (FR-17): PMC Charge Types settings page -- list/add/edit/
  // deactivate PMCChargeType rows for the active PMC. Not nested under
  // ledger/general/cash (spec Always: "not a general PMC profile editor")
  // -- a standalone settings page, its own top-level nav entry.
  {
    path: ':pmcId/pmc-charge-types',
    component: PmcChargeTypesComponent,
    canActivate: [financePmcReachableGuard],
    resolve: { financeActivation: financeActivationResolver },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinanceRoutingModule {}
