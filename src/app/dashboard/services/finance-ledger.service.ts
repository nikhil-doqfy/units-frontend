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

  getAccountLedgerLines(
    pmcId: string,
    accountId: number,
    startDate: string,
    endDate: string,
    page: number,
    pageSize: number,
  ): Observable<any> {
    const queryString = this.sharedService.getQueryString({
      pmc_id: pmcId,
      start_date: startDate,
      end_date: endDate,
      page,
      page_size: pageSize,
    });
    return this.http.get(
      `${this.FINANCE_SERVER_ADDRESS}/accounts/${accountId}/ledger-lines${queryString}`,
    );
  }

  /**
   * Story 5.1: `GET ledger/manual-entries/` -- lists existing manual
   * entries for the active PMC, backing the Manual Entries list view
   * (Ledger Entries -> General -> Cash -> Manual Entries).
   */
  getManualJournalEntries(pmcId: string): Observable<any> {
    const queryString = this.sharedService.getQueryString({
      pmc_id: pmcId,
    });
    return this.http.get(
      `${this.FINANCE_SERVER_ADDRESS}/ledger/manual-entries/${queryString}`,
    );
  }

  /**
   * Story 5.1: `POST ledger/manual-entries/` -- creates a balanced manual
   * `JournalEntry` (`source_type=MANUAL`). `lines` is a list of
   * `{account_id, debit, credit}` objects, matching the spec's example
   * payload shape exactly.
   */
  createManualJournalEntry(
    pmcId: string,
    lines: { account_id: number; debit: string; credit: string }[],
    memo = '',
  ): Observable<any> {
    return this.http.post(
      `${this.FINANCE_SERVER_ADDRESS}/ledger/manual-entries/`,
      {
        pmc_id: pmcId,
        memo,
        lines,
      },
    );
  }

  /**
   * Story 5.2: `GET ledger/pmc-charge-types/` -- lists existing
   * `(FinancePMCProfile, charge_id)` -> Account mappings for the active
   * PMC, backing the new PMC Charge Types settings page.
   */
  getPmcChargeTypes(pmcId: string): Observable<any> {
    const queryString = this.sharedService.getQueryString({
      pmc_id: pmcId,
    });
    return this.http.get(
      `${this.FINANCE_SERVER_ADDRESS}/ledger/pmc-charge-types/${queryString}`,
    );
  }

  /**
   * Story 5.2: `POST ledger/pmc-charge-types/` -- creates or updates a
   * `(FinancePMCProfile, charge_id)` -> Account mapping. A second call for
   * the same `charge_id` updates the existing row (account/active) rather
   * than creating a duplicate (backend upserts on the pair).
   */
  savePmcChargeType(
    pmcId: string,
    chargeId: number,
    accountId: number,
    active: boolean,
  ): Observable<any> {
    return this.http.post(
      `${this.FINANCE_SERVER_ADDRESS}/ledger/pmc-charge-types/`,
      {
        pmc_id: pmcId,
        charge_id: chargeId,
        account_id: accountId,
        active,
      },
    );
  }
}
