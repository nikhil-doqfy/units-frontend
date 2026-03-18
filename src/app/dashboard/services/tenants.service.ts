import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SharedService } from '../../shared.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TenantsService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}

  getTenantByEmail(email: string): Observable<any> {
    return this.http.get(`${this.SERVER_ADDRESS}/user/tenant?email=${encodeURIComponent(email)}`);
  }

  getTenantsByTab(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/api/tenant-leases${queryString}`);
  }

  exportTenantsByTab(params: Record<string, any>): Observable<Blob> {
    const queryString = this.sharedService.getQueryString({ ...params, export: 'csv' });
    return this.http.get(`${this.SERVER_ADDRESS}/api/tenant-leases${queryString}`, { responseType: 'blob' });
  }

  getTenants(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/tenant/table${queryString}`);
  }

  getExcelFileOfTenant(params: any): Observable<Blob> {
    const query = this.sharedService.getQueryString(params);

    return this.http.get(`${this.SERVER_ADDRESS}/tenant_csv${query}`, {
      responseType: 'blob',
    });
  }

  getTenantDetails(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/tenant/table${queryString}`);
  }

  addTenantToInvite(data: Record<'email', string>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/invitation`, data);
  }

  addTenant(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/tenant/details/`, data);
  }

  getLeasePdf(leaseId: number, purpose?: 'download') {
    let url = `${this.SERVER_ADDRESS}/lease_pdf?lease_id=${leaseId}`;

    if (purpose === 'download') {
      url += `&purpose=download`;
    }

    return this.http.get(url);
  }
  getTenantsDetailsView(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/tenant/details/${queryString}`
    );
  }
}
