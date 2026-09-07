import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { ReconciliationService } from '../../../../services/reconciliation.service';

/**
 * Story 3.4's un-reconcile form, rendered beneath the manual-pairing form
 * on the Reconciliation Workspace page. Reuses
 * `ReconciliationService.applyMatchDecision()` unchanged, with the new
 * `'unreconcile'` action value (Spine AD-16, resolved) -- the backend
 * flips a currently-`confirmed` `BankStatementMatch` to `unreconciled` and
 * frees `bank_statement_line.reconciled` back to `False`, 409ing if the
 * pair isn't currently confirmed.
 *
 * No browsable/dropdown picker of currently-confirmed matches: same
 * AD-15-shaped gap as Story 3.3's manual-pairing form -- no backend
 * endpoint exists to enumerate them, so both inputs are plain numeric
 * fields validated only as "positive integer" (spec Boundaries &
 * Constraints).
 *
 * On success, emits `unreconciled` so the host page can call the
 * suggested-matches queue's `refreshQueue()` -- same cross-component
 * coordination pattern as upload/manual-match. On failure, no inline
 * error message: the global `http.interceptor.ts` already toasts the
 * backend's exact rejection reason.
 */
@Component({
  selector: 'app-un-reconcile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './un-reconcile-form.component.html',
})
export class UnReconcileFormComponent {
  private reconciliationService = inject(ReconciliationService);
  private destroyRef = inject(DestroyRef);

  @Input() pmcId = '';

  @Output() unreconciled = new EventEmitter<void>();

  statementLineIdControl = new FormControl<number | null>(null, {
    validators: [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)],
  });

  journalEntryIdControl = new FormControl<number | null>(null, {
    validators: [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)],
  });

  submitting = false;

  get canSubmit(): boolean {
    return (
      !this.submitting &&
      !!this.pmcId &&
      this.statementLineIdControl.valid &&
      this.journalEntryIdControl.valid
    );
  }

  submit(): void {
    if (!this.canSubmit) return;

    const bankStatementLineId = Number(this.statementLineIdControl.value);
    const journalEntryId = Number(this.journalEntryIdControl.value);

    this.submitting = true;

    this.reconciliationService
      .applyMatchDecision(
        this.pmcId,
        bankStatementLineId,
        journalEntryId,
        'unreconcile',
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.statementLineIdControl.reset(null);
          this.journalEntryIdControl.reset(null);
          this.unreconciled.emit();
        },
        error: () => {
          // No inline error message here: the global http.interceptor.ts
          // already toasts the backend's exact `error.message` for any
          // non-2xx response (AlertService) -- same convention as every
          // other Reconciliation mutation. The UI never shows an
          // optimistic success (spec Boundaries & Constraints).
          this.submitting = false;
        },
      });
  }
}
