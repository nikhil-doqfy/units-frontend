import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SharedService } from '../../shared.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LeadsService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  getLeads(params: Record<string, any> = {}): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/lead${queryString}`);
  }

  getLeadById(leadId: number | string): Observable<any> {
    return this.http.get(`${this.SERVER_ADDRESS}/lead?lead_id=${leadId}`);
  }

  createLead(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/lead`, data);
  }

  updateLead(leadId: string, data: Record<string, any>): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/lead`, { ...data, lead_id: leadId });
  }

  deleteLead(leadId: string): Observable<any> {
    return this.http.delete(`${this.SERVER_ADDRESS}/lead?lead_id=${leadId}`);
  }

  exportLeads(params: Record<string, any> = {}): void {
    const queryString = this.sharedService.getQueryString({ ...params, export: 'csv' });
    this.http.get(`${this.SERVER_ADDRESS}/lead${queryString}`, { responseType: 'blob' }).subscribe((blob) => {
      this.sharedService.downloadBlob(blob, 'leads.csv');
    });
  }

  bulkImportLeads(fileBase64: string): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/lead/bulk-import`, { file: fileBase64 });
  }

  getActivityLogs(leadId: number): Observable<any> {
    return this.http.get(`${this.SERVER_ADDRESS}/lead/activity-log?lead_id=${leadId}`);
  }

  createActivityLog(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/lead/activity-log`, data);
  }

  updateActivityLog(logId: number, data: Record<string, any>): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/lead/activity-log`, { ...data, log_id: logId });
  }

  deleteActivityLog(logId: number): Observable<any> {
    return this.http.delete(`${this.SERVER_ADDRESS}/lead/activity-log?log_id=${logId}`);
  }
}
