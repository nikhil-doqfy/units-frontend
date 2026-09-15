import { Component, DestroyRef, Input, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of, tap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { FinanceLedgerService } from '../../../../../../../services/finance-ledger.service';

interface ChartOfAccountsRow {
  id: number;
  name: string;
  account_type: string;
  balance: string;
}

/** One editable debit/credit line row in the add-entry form. */
interface FormLine {
  account_id: number | null;
  debit: string;
  credit: string;
}

function emptyFormLine(): FormLine {
  return { account_id: null, debit: '0.00', credit: '0.00' };
}

/**
 * Spec 5.1b: the Manual Entries add-entry form, moved out of the page's
 * inline `app-white-card` into an `NgbModal` popup (matching
 * `all-leads.component.ts`'s `ScheduleMeetingModalComponent` pattern --
 * `@Input`s set via `modalRef.componentInstance`, `NgbActiveModal` injected
 * to close/dismiss itself). Carries over `manual-entries.component.ts`'s
 * previous `memo`/`formLines`/`addLine`/`removeLine`/`submit` state and
 * client-side balance pre-check verbatim -- only the "Remove" line control
 * changes (text -> trash icon), never its behavior.
 */
@Component({
  selector: 'app-manual-entry-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './manual-entry-modal.component.html',
})
export class ManualEntryModalComponent {
  @Input() pmcId = '';
  @Input() accounts: ChartOfAccountsRow[] = [];

  private financeLedgerService = inject(FinanceLedgerService);
  private destroyRef = inject(DestroyRef);
  activeModal = inject(NgbActiveModal);

  memo = '';
  formLines: FormLine[] = [emptyFormLine(), emptyFormLine()];
  submitting = false;
  balanceError: string | null = null;

  addLine(): void {
    this.formLines.push(emptyFormLine());
  }

  removeLine(index: number): void {
    if (this.formLines.length <= 2) return;
    this.formLines.splice(index, 1);
  }

  private computeTotals(): { debit: number; credit: number } {
    return this.formLines.reduce(
      (totals, line) => ({
        debit: totals.debit + (Number(line.debit) || 0),
        credit: totals.credit + (Number(line.credit) || 0),
      }),
      { debit: 0, credit: 0 },
    );
  }

  submit(): void {
    if (this.submitting || !this.pmcId) return;

    this.balanceError = null;

    const withAccount = this.formLines.filter(
      (line) => line.account_id !== null,
    );
    if (withAccount.length < 2) {
      this.balanceError = 'FINANCE_MANUAL_ENTRY_MIN_LINES';
      return;
    }

    // Client-side mirror of the backend's own balance check (spec
    // Boundaries & Constraints) -- avoids a round-trip for the common
    // typo case; the backend remains the sole source of truth.
    const totals = this.computeTotals();
    if (totals.debit.toFixed(2) !== totals.credit.toFixed(2)) {
      this.balanceError = 'FINANCE_MANUAL_ENTRY_UNBALANCED';
      return;
    }

    this.submitting = true;

    const lines = withAccount.map((line) => ({
      account_id: line.account_id as number,
      debit: (Number(line.debit) || 0).toFixed(2),
      credit: (Number(line.credit) || 0).toFixed(2),
    }));

    this.financeLedgerService
      .createManualJournalEntry(this.pmcId, lines, this.memo)
      .pipe(
        tap(() => {
          this.submitting = false;
          this.activeModal.close(true);
        }),
        catchError(() => {
          // No inline error message here: the global http.interceptor.ts
          // already toasts the backend's exact `error.message` for any
          // non-2xx response (mirrors BankStatementUploadComponent's
          // established convention) -- surfacing it a second time inline
          // would show the identical text twice.
          this.submitting = false;
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }
}
