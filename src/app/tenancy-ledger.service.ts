import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SharedService } from './shared.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TenancyLedgerService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;
  constructor() {}
  getTenancyLedger(params?: any): Observable<any> {
    return this.http.get(`${this.SERVER_ADDRESS}/tenancy-ledger`, {
      params,
    });
  }
  exportTenacyLedger(params: Record<string, any> = {}): Observable<Blob> {
    const queryString = this.sharedService.getQueryString({
      ...params,
      export: 'true',
    });
    return this.http.get(
      `${this.SERVER_ADDRESS}/tenancy-ledger${queryString}`,
      {
        responseType: 'blob',
      },
    );
  }
  shareTenancyLedger(leaseId: number): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/share/tenancy-ledger`, {
      lease_id: leaseId,
    });
  }
}
