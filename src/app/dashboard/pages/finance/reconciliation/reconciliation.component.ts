import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { FinanceEmptyStateComponent } from '../component/finance-empty-state/finance-empty-state.component';
import { BankStatementUploadComponent } from '../component/bank-statement-upload/bank-statement-upload.component';
import { SuggestedMatchesQueueComponent } from '../component/suggested-matches-queue/suggested-matches-queue.component';
import { ManualMatchFormComponent } from '../component/manual-match-form/manual-match-form.component';
import { UnReconcileFormComponent } from '../component/un-reconcile-form/un-reconcile-form.component';
import { FinanceActivationState } from '../finance-activation.resolver';

/**
 * Story 3.1's Reconciliation Workspace page. Mirrors the report pages'
 * reactive `paramMap` subscription (Angular's default RouteReuseStrategy
 * reuses this component instance when only `:pmcId` changes, so a
 * snapshot-only read would keep showing the previous PMC's state) and
 * `FinanceEmptyStateComponent` gating. Renders the bank statement upload
 * control (Story 3.1), the suggested-matches queue with Confirm/Reject
 * (Story 3.2), the manual-pairing form (Story 3.3), and the un-reconcile
 * form (Story 3.4) when activated.
 */
@Component({
  selector: 'app-reconciliation',
  standalone: true,
  imports: [
    CommonModule,
    FinanceEmptyStateComponent,
    BankStatementUploadComponent,
    SuggestedMatchesQueueComponent,
    ManualMatchFormComponent,
    UnReconcileFormComponent,
  ],
  templateUrl: './reconciliation.component.html',
})
export class ReconciliationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  pmcId = '';
  financeActivation: FinanceActivationState = 'not_activated';

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.pmcId = params.get('pmcId') ?? '';
        this.financeActivation = this.route.snapshot.data[
          'financeActivation'
        ] as FinanceActivationState;
      });
  }
}
