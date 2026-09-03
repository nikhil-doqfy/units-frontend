import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SharedService } from '../../shared.service';
import { environment } from '../../../environments/environment';

/**
 * AD-8's first Finance service. Every URL is built from
 * `FINANCE_SERVER_ADDRESS` only, never `SERVER_ADDRESS` (spec Boundaries &
 * Constraints). Mirrors `PropertyService`'s established HTTP-service shape:
 * `inject(HttpClient)`, `inject(SharedService)`, build URL from an
 * environment constant + `getQueryString`, return a raw `Observable<any>` --
 * envelope unwrapping happens at the consumer via `unwrapFinanceEnvelope`,
 * not in this service.
 */
@Injectable({
  providedIn: 'root',
})
export class FinanceReportsService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private FINANCE_SERVER_ADDRESS = environment.FINANCE_SERVER_ADDRESS;

  getProfitLoss(
    pmcId: string,
    startDate: string,
    endDate: string,
  ): Observable<any> {
    const queryString = this.sharedService.getQueryString({
      pmc_id: pmcId,
      start_date: startDate,
      end_date: endDate,
    });
    return this.http.get(
      `${this.FINANCE_SERVER_ADDRESS}/reports/profit-loss/${queryString}`,
    );
  }

  getTrialBalance(
    pmcId: string,
    startDate: string,
    endDate: string,
  ): Observable<any> {
    const queryString = this.sharedService.getQueryString({
      pmc_id: pmcId,
      start_date: startDate,
      end_date: endDate,
    });
    return this.http.get(
      `${this.FINANCE_SERVER_ADDRESS}/reports/trial-balance/${queryString}`,
    );
  }

  getBalanceSheet(pmcId: string, asOfDate: string): Observable<any> {
    const queryString = this.sharedService.getQueryString({
      pmc_id: pmcId,
      as_of_date: asOfDate,
    });
    return this.http.get(
      `${this.FINANCE_SERVER_ADDRESS}/reports/balance-sheet/${queryString}`,
    );
  }

  getAgeing(pmcId: string, page: number, pageSize: number): Observable<any> {
    const queryString = this.sharedService.getQueryString({
      pmc_id: pmcId,
      page: page,
      page_size: pageSize,
    });
    return this.http.get(
      `${this.FINANCE_SERVER_ADDRESS}/reports/ageing/${queryString}`,
    );
  }
}
