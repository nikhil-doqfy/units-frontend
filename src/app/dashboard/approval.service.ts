import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../shared.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ApprovalService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}
  getApprovalList(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/tenants_Approved_Rejected${queryString}`
    );
  }

  editApproval(data: Record<string, any>): Observable<any> {
    return this.http.put(
      `${this.SERVER_ADDRESS}/tenants_Approved_Rejected`,
      data
    );
  }

  getManagerApprovals(params: Record<string, any> = {}): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/api/approval${queryString}`);
  }

  updateManagerApproval(data: { approval_id: number; action: 'approve' | 'reject' }): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/api/approval`, data);
  }
}
