import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SharedService } from '../../shared.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OwnerService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}

  // ------------------------- getOwnerDetails -------------------------
  getOwnerDetails(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/company/owners${queryString}`);
  }

  // ------------------------- Owner CRUD (user_service) -------------------------
  getOwners(params: Record<string, any> = {}): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/user/owner${queryString}`);
  }

  createOwner(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/user/owner`, data);
  }

  updateOwner(data: Record<string, any>): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/user/owner`, data);
  }

  deleteOwner(ownerId: number): Observable<any> {
    return this.http.delete(`${this.SERVER_ADDRESS}/user/owner?owner_id=${ownerId}`);
  }

  exportOwners(params: Record<string, any> = {}): Observable<Blob> {
    const queryString = this.sharedService.getQueryString({ ...params, export: 'csv' });
    return this.http.get(`${this.SERVER_ADDRESS}/user/owner${queryString}`, { responseType: 'blob' });
  }

  // ------------------------- addOwnerToInvite -------------------------
  addOwnerToInvite(data: Record<'email', string>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/invitation`, data);
  }

  getExcelFileOfowner(params: any) {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/company_owners_csv${queryString}`,
      { responseType: 'blob' }
    );
  }

  getOwnerPdf(leaseId: number, type?: 'download') {
    let url = `${this.SERVER_ADDRESS}/lease_pdf?lease_id=${leaseId}`;
    if (type === 'download') url += `&purpose=download`;
    return this.http.get(url);
  }
}
