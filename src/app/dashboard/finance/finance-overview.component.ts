import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WhiteCardComponent } from '../../shared/component/white-card/white-card.component';
import { CustomSelectComponent } from '../component/custom-select/custom-select.component';
import { FinanceReportsService } from './finance-reports.service';
import { unwrapFinanceEnvelope } from './finance-envelope';
import { FinanceActivationState } from './finance-activation.resolver';
import {
  FinanceReachablePmcService,
  ReachablePmc,
} from './finance-reachable-pmc.service';
import { StorageService } from '../../shared/services/storage.service';

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
 * Story 1.5 adds the PMC selector: fetched alongside the existing
 * `paramMap` subscription (one `getReachablePmcs()` call per navigation),
 * shown only when reachable to 2+ PMCs, and selection navigates via
 * `Router` to the new `:pmcId` rather than mutating any local/shared state
 * -- this re-triggers Story 1.3's guards/resolver and this component's own
 * reactive `paramMap` fetch, which is what guarantees no stale data
 * survives the transition (NFR5).
 */
@Component({
  selector: 'app-finance-overview',
  standalone: true,
  imports: [CommonModule, WhiteCardComponent, CustomSelectComponent],
  templateUrl: './finance-overview.component.html',
})
export class FinanceOverviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private financeReportsService = inject(FinanceReportsService);
  private financeReachablePmcService = inject(FinanceReachablePmcService);
  private storageService = inject(StorageService);
  private destroyRef = inject(DestroyRef);

  pmcId = '';
  financeActivation: FinanceActivationState = 'not_activated';

  reachablePmcs: ReachablePmc[] = [];
  get showSelector(): boolean {
    return this.reachablePmcs.length > 1;
  }
  get selectedPmc(): ReachablePmc | null {
    return this.reachablePmcs.find((p) => p.id === this.pmcId) ?? null;
  }

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

        this.profitLoss = null;
        this.profitLossFailed = false;
        this.trialBalance = null;
        this.trialBalanceFailed = false;

        if (this.financeActivation === 'activated' && this.pmcId) {
          this.loadReports();
        }

        this.loadReachablePmcs();
      });
  }

  private loadReachablePmcs(): void {
    this.financeReachablePmcService
      .getReachablePmcs()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((reachablePmcs) => {
        this.reachablePmcs = reachablePmcs;
      });
  }

  onPmcSelected(pmc: ReachablePmc): void {
    if (!pmc || !pmc.id || pmc.id === this.pmcId) {
      return;
    }
    this.storageService.setLastFinancePmcId(pmc.id);
    this.router.navigate(['/dashboard/finance', pmc.id, 'overview']);
  }

  private loadReports(): void {
    const { startDate, endDate } = this.getCurrentMonthRange();

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

  private getCurrentMonthRange(): { startDate: string; endDate: string } {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      startDate: this.toIsoDate(firstOfMonth),
      endDate: this.toIsoDate(now),
    };
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
