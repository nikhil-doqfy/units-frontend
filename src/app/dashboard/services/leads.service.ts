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
    return this.http.get(`${this.SERVER_ADDRESS}/lead/${leadId}`);
  }

  createLead(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/lead`, data);
  }

  updateLead(leadId: string, data: Record<string, any>): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/lead/${leadId}`, data);
  }

  deleteLead(leadId: string): Observable<any> {
    return this.http.delete(`${this.SERVER_ADDRESS}/lead/${leadId}`);
  }

  // ── Proposal & Hold (Dubai Leasing Management Flow, Phase 1) ──────────────

  sendProposal(leadId: number | string, data: Record<string, any> = {}): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/lead/send-proposal`, { lead_id: leadId, ...data });
  }

  respondToProposal(proposalId: number | string, data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/lead/respond-to-proposal`, { proposal_id: proposalId, ...data });
  }

  confirmHoldAndProceed(proposalId: number | string, data: Record<string, any> = {}): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/lead/confirm-hold-and-proceed`, { proposal_id: proposalId, ...data });
  }

  releaseExpiredHold(proposalId: number | string): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/lead/release-expired-hold`, { proposal_id: proposalId });
  }

  exportLeads(params: Record<string, any> = {}): void {
    const queryString = this.sharedService.getQueryString({ ...params, export: 'csv' });
    this.http.get(`${this.SERVER_ADDRESS}/lead${queryString}`, { responseType: 'blob' }).subscribe((blob) => {
      this.sharedService.downloadBlob(blob, 'leads.csv');
    });
  }

  checkActiveLease(leadId: number | string): Observable<any> {
    return this.http.get(`${this.SERVER_ADDRESS}/lead/check-active-lease?lead_id=${leadId}`);
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
