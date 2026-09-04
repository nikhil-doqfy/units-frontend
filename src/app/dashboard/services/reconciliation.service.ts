import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Story 3.1's `ReconciliationService`. Mirrors `FinanceReportsService`'s
 * established HTTP-service shape (`inject(HttpClient)`, build URL from
 * `FINANCE_SERVER_ADDRESS`), substituting a `FormData` POST body for a GET
 * query string.
 *
 * `uploadBankStatement` is scoped narrowly to this one AD-9 correction:
 * `pmc_id` is confirmed against the real backend view
 * (`ledger/views.py:606`) to be read from the multipart body itself, not a
 * URL/query param. This does not set a precedent for this service's future
 * methods (suggested-matches, match, un-reconcile, Stories 3.2-3.4), which
 * are GET/PUT-shaped and will scope by URL/query param like every other
 * Finance service (spec Design Notes).
 */
@Injectable({
  providedIn: 'root',
})
export class ReconciliationService {
  private http = inject(HttpClient);
  private FINANCE_SERVER_ADDRESS = environment.FINANCE_SERVER_ADDRESS;

  uploadBankStatement(pmcId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pmc_id', pmcId);

    return this.http.post(
      `${this.FINANCE_SERVER_ADDRESS}/reconciliation/bank-statement-import/`,
      formData,
    );
  }

  /**
   * Story 3.2: `GET reconciliation/suggested-matches` (`views.py:687`).
   * `pmc_id` travels as a query param here -- the GET convention every
   * other Finance endpoint follows -- unlike `applyMatchDecision`'s POST
   * body below (spec Boundaries & Constraints / Design Notes).
   */
  getSuggestedMatches(pmcId: string): Observable<any> {
    return this.http.get(
      `${this.FINANCE_SERVER_ADDRESS}/reconciliation/suggested-matches`,
      { params: { pmc_id: pmcId } },
    );
  }

  /**
   * Story 3.2: `POST reconciliation/match` (`views.py:767`). All four
   * fields -- including `pmc_id` -- are read from the JSON body by the
   * real backend (`request.data`), not query params: confirmed distinct
   * from `getSuggestedMatches`'s GET convention (spec Boundaries &
   * Constraints).
   */
  applyMatchDecision(
    pmcId: string,
    bankStatementLineId: number,
    journalEntryId: number,
    action: 'confirm' | 'reject',
  ): Observable<any> {
    return this.http.post(
      `${this.FINANCE_SERVER_ADDRESS}/reconciliation/match`,
      {
        pmc_id: pmcId,
        bank_statement_line_id: bankStatementLineId,
        journal_entry_id: journalEntryId,
        action,
      },
    );
  }
}
