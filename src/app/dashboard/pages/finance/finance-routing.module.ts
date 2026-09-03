import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FinanceOverviewComponent } from './overview/finance-overview.component';
import { FinanceLandingComponent } from './landing/finance-landing.component';
import { TrialBalanceComponent } from './trial-balance/trial-balance.component';
import { ProfitLossComponent } from './profit-loss/profit-loss.component';
import { financeLandingGuard } from './finance-landing.guard';
import { financePmcReachableGuard } from './finance-pmc-reachable.guard';
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinanceRoutingModule {}
