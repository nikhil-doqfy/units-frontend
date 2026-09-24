import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { WhiteCardComponent } from '../../../../shared/component/white-card/white-card.component';
import { FinanceEmptyStateComponent } from '../component/finance-empty-state/finance-empty-state.component';
import { FinanceNavComponent } from '../component/finance-nav/finance-nav.component';
import { FinanceReportsService } from '../../../services/finance-reports.service';
import { unwrapFinanceEnvelope } from '../finance-envelope';
import { FinanceActivationState } from '../finance-activation.resolver';
import { getCurrentMonthRange } from '../finance-date-range';
import { SharedService } from '../../../../shared.service';
import { BreadCrumb } from '../../../../shared/model/shared.model';

interface ProfitLossContent {
  net_profit_loss: number;
}

interface TrialBalanceContent {
  balanced: boolean;
}

/**
 * Story 1.4's real Finance Overview, replacing `FinanceStubComponent` on
 * the `:pmcId/overview` route. Reads `:pmcId` via `ActivatedRoute` and
 * `financeActivation` via `route.snapshot.data` (Story 1.3's resolver ran
 * before this component mounts, since it's registered under the same
 * route's `resolve` block) -- this is the first place in the codebase this
 * resolved value is actually consumed.
 *
 * Report calls only fire when `financeActivation === 'activated'` (spec
 * Boundaries & Constraints, AD-5): when it is `'not_activated'` or
 * `'activated_empty'`, no report calls fire at all and an empty-state
 * placeholder renders instead of the 3 cards.
 *
 * Story 1.5 originally added an in-page PMC selector here; superseded by
 * the navbar's global PMC selector (`SelectedPmcService`), which now
 * drives Finance PMC switching for every Finance page via
 * `FinanceNavComponent` (shared across all of them) navigating to the
 * new `:pmcId` -- this still re-triggers Story 1.3's guards/resolver and
 * this component's own reactive `paramMap` fetch, so NFR5 (no stale data
 * survives the transition) still holds.
 */
@Component({
  selector: 'app-finance-overview',
  standalone: true,
  imports: [
    CommonModule,
    WhiteCardComponent,
    FinanceEmptyStateComponent,
    FinanceNavComponent,
    TranslateModule,
  ],
  templateUrl: './finance-overview.component.html',
})
export class FinanceOverviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private financeReportsService = inject(FinanceReportsService);
  private sharedService = inject(SharedService);
  private destroyRef = inject(DestroyRef);

  pmcId = '';
  financeActivation: FinanceActivationState = 'not_activated';
  breadcrumbData: BreadCrumb[] = [];

  profitLoss: ProfitLossContent | null = null;
  profitLossFailed = false;
  trialBalance: TrialBalanceContent | null = null;
  trialBalanceFailed = false;

  ngOnInit(): void {
    // Read params/data reactively, not from a one-time snapshot: Angular's
    // default RouteReuseStrategy reuses this component instance when only
    // `:pmcId` changes (e.g. switching PMCs via Story 1.5's selector), so a
    // snapshot-only read would keep showing the previous PMC's data.
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.pmcId = params.get('pmcId') ?? '';
        this.financeActivation = this.route.snapshot.data[
          'financeActivation'
        ] as FinanceActivationState;
        this.loadBreadcrumb();

        this.profitLoss = null;
        this.profitLossFailed = false;
        this.trialBalance = null;
        this.trialBalanceFailed = false;

        if (this.financeActivation === 'activated' && this.pmcId) {
          this.loadReports();
        }
      });
  }

  private loadBreadcrumb(): void {
    this.sharedService
      .getBreadcrumbs([
        { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
        { label: 'PAGE_TITLE.FINANCE', link: '' },
      ])
      .subscribe((data) => (this.breadcrumbData = data));
  }

  private loadReports(): void {
    const { startDate, endDate } = getCurrentMonthRange();

    this.financeReportsService
      .getProfitLoss(this.pmcId, startDate, endDate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          this.profitLoss = unwrapFinanceEnvelope<ProfitLossContent>(resp);
        },
        error: () => {
          this.profitLossFailed = true;
        },
      });

    this.financeReportsService
      .getTrialBalance(this.pmcId, startDate, endDate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          this.trialBalance = unwrapFinanceEnvelope<TrialBalanceContent>(resp);
        },
        error: () => {
          this.trialBalanceFailed = true;
        },
      });
  }
}
