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
}
