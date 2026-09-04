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

import { ReconciliationService } from '../../../../services/reconciliation.service';

/**
 * Story 3.3's manual-pairing form, rendered beneath the suggested-matches
 * queue on the Reconciliation Workspace page. Reuses
 * `ReconciliationService.applyMatchDecision()` (Story 3.2) unchanged --
 * this is the same PMC-scoped `(bank_statement_line_id, journal_entry_id)`
 * pairing mechanism the queue's Confirm button uses, just with both IDs
 * typed in rather than sourced from a heuristic suggestion.
 *
 * No browsable/dropdown entry picker: AD-15 has no backend endpoint to
 * enumerate unreconciled entries yet, so both inputs are plain numeric
 * fields validated only as "positive integer" -- the backend is the sole
 * source of truth for whether a pair is valid (spec Boundaries &
 * Constraints).
 *
 * On success, emits `paired` so the host page can call the
 * suggested-matches queue's `refreshQueue()` -- same cross-component
 * coordination pattern as `bank-statement-upload.component.ts`'s
 * `(uploaded)` output (Story 3.2's review-added fix). On failure, no
 * inline error message: the global `http.interceptor.ts` already toasts
 * the backend's exact rejection reason (AlertService) -- same convention
 * as upload and the queue's own Confirm/Reject.
 */
@Component({
  selector: 'app-manual-match-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manual-match-form.component.html',
})
export class ManualMatchFormComponent {
  private reconciliationService = inject(ReconciliationService);
  private destroyRef = inject(DestroyRef);

  @Input() pmcId = '';

  @Output() paired = new EventEmitter<void>();

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
        'confirm',
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.statementLineIdControl.reset(null);
          this.journalEntryIdControl.reset(null);
          this.paired.emit();
        },
        error: () => {
          // No inline error message here: the global http.interceptor.ts
          // already toasts the backend's exact `error.message` for any
          // non-2xx response (AlertService) -- same convention as
          // bank-statement-upload.component.ts and the suggested-matches
          // queue's own Confirm/Reject. The UI never shows an optimistic
          // success (spec Boundaries & Constraints).
          this.submitting = false;
        },
      });
  }
}
