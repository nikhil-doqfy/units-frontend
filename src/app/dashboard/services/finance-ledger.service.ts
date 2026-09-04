import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SharedService } from '../../shared.service';
import { environment } from '../../../environments/environment';

/**
 * AD-8's third Finance service (Story 4.1's first real method). Mirrors
 * `FinanceReportsService`'s established HTTP-service shape: every URL is
 * built from `FINANCE_SERVER_ADDRESS` only, `inject(HttpClient)`,
 * `inject(SharedService)`, build URL from an environment constant +
 * `getQueryString`, return a raw `Observable<any>` -- envelope unwrapping
 * happens at the consumer via `unwrapFinanceEnvelope`, not in this service.
 */
@Injectable({
  providedIn: 'root',
})
export class FinanceLedgerService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private FINANCE_SERVER_ADDRESS = environment.FINANCE_SERVER_ADDRESS;

  getChartOfAccounts(pmcId: string): Observable<any> {
    const queryString = this.sharedService.getQueryString({
      pmc_id: pmcId,
    });
    return this.http.get(
      `${this.FINANCE_SERVER_ADDRESS}/accounts/${queryString}`,
    );
  }
}
