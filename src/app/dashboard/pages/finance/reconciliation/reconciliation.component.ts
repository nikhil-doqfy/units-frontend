import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { FinanceEmptyStateComponent } from '../component/finance-empty-state/finance-empty-state.component';
import { BankStatementUploadComponent } from '../component/bank-statement-upload/bank-statement-upload.component';
import { FinanceActivationState } from '../finance-activation.resolver';

/**
 * Story 3.1's Reconciliation Workspace page. Mirrors the report pages'
 * reactive `paramMap` subscription (Angular's default RouteReuseStrategy
 * reuses this component instance when only `:pmcId` changes, so a
 * snapshot-only read would keep showing the previous PMC's state) and
 * `FinanceEmptyStateComponent` gating. Renders only the bank statement
 * upload control when activated -- the suggested-matches queue,
 * confirm/reject, manual pairing, and un-reconcile are out of scope for
 * this story (Stories 3.2-3.4).
 */
@Component({
  selector: 'app-reconciliation',
  standalone: true,
  imports: [
    CommonModule,
    FinanceEmptyStateComponent,
    BankStatementUploadComponent,
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
