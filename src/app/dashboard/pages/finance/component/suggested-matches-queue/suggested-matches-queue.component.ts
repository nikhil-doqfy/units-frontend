import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { ReconciliationService } from '../../../../services/reconciliation.service';
import { unwrapFinanceEnvelope } from '../../finance-envelope';

interface SuggestedMatch {
  bank_statement_line_id: number;
  journal_entry_id: number;
  amount: string;
  statement_date: string;
  posted_at: string;
}

interface SuggestedMatchesContent {
  pmc_id: number;
  suggestions: SuggestedMatch[];
}

/**
 * Story 3.2's suggested-matches queue, rendered beneath the bank statement
 * upload control on the Reconciliation Workspace page. Fetches via
 * `ReconciliationService.getSuggestedMatches()` on init and exposes
 * `refreshQueue()` for both its own Confirm/Reject handlers and the host
 * page to call.
 *
 * Each row is identified by its `(bank_statement_line_id,
 * journal_entry_id)` pair -- the API returns no other row ID (spec
 * Boundaries & Constraints). Every mutation (Confirm or Reject) ends in a
 * full `refreshQueue()` re-fetch on success -- no optimistic local
 * splice/patch of `suggestions` (AD-10).
 */
@Component({
  selector: 'app-suggested-matches-queue',
  standalone: true,
  imports: [CommonModule, DatePipe, TranslateModule],
  templateUrl: './suggested-matches-queue.component.html',
})
export class SuggestedMatchesQueueComponent implements OnInit {
  private reconciliationService = inject(ReconciliationService);
  private destroyRef = inject(DestroyRef);

  @Input() pmcId = '';

  suggestions: SuggestedMatch[] = [];
  loading = false;
  loadFailed = false;

  // Tracks the pair currently mid-decision so its own Confirm/Reject
  // buttons can be disabled without touching any other row's state --
  // not optimistic UI: the row still only disappears/persists once
  // refreshQueue()'s re-fetch resolves (AD-10).
  decidingKey: string | null = null;

  ngOnInit(): void {
    this.refreshQueue();
  }

  rowKey(suggestion: SuggestedMatch): string {
    return `${suggestion.bank_statement_line_id}:${suggestion.journal_entry_id}`;
  }

  trackByRowKey(_index: number, suggestion: SuggestedMatch): string {
    return this.rowKey(suggestion);
  }

  refreshQueue(): void {
    if (!this.pmcId) return;

    this.loading = true;
    this.loadFailed = false;

    this.reconciliationService
      .getSuggestedMatches(this.pmcId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          this.loading = false;
          this.loadFailed = false;
          const content = unwrapFinanceEnvelope<SuggestedMatchesContent>(
            resp,
          );
          this.suggestions = content?.suggestions ?? [];
        },
        error: () => {
          this.loading = false;
          this.loadFailed = true;
          this.suggestions = [];
        },
      });
  }

  confirm(suggestion: SuggestedMatch): void {
    this.decide(suggestion, 'confirm');
  }

  reject(suggestion: SuggestedMatch): void {
    this.decide(suggestion, 'reject');
  }

  private decide(
    suggestion: SuggestedMatch,
    action: 'confirm' | 'reject',
  ): void {
    if (!this.pmcId || this.decidingKey) return;

    const key = this.rowKey(suggestion);
    this.decidingKey = key;

    this.reconciliationService
      .applyMatchDecision(
        this.pmcId,
        suggestion.bank_statement_line_id,
        suggestion.journal_entry_id,
        action,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.decidingKey = null;
          // AD-10: always a full re-fetch, never a local splice/patch.
          this.refreshQueue();
        },
        error: () => {
          // No inline error message here: the global http.interceptor.ts
          // already toasts the backend's exact `error.message` for any
          // non-2xx response (AlertService) -- same convention as
          // `bank-statement-upload.component.ts`.
          this.decidingKey = null;
        },
      });
  }
}
