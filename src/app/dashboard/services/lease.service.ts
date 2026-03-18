import { inject, Injectable } from '@angular/core';
import { SharedService } from '../../shared.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LeaseService {
  private sharedService = inject(SharedService);
  private http = inject(HttpClient);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}

  // ── New Lease CRUD ────────────────────────────────────────────────────

  createLease(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/api/lease`, data);
  }

  updateLease(data: Record<string, any>): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/api/lease`, data);
  }

  deleteLease(leaseId: number): Observable<any> {
    return this.http.delete(`${this.SERVER_ADDRESS}/api/lease?lease_id=${leaseId}`);
  }

  getLeaseById(leaseId: number): Observable<any> {
    return this.http.get(`${this.SERVER_ADDRESS}/api/lease?lease_id=${leaseId}`);
  }

  // ─────────────────────────────────────────────────────────────────────

  getLeasePropertyDetails(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/lease/tenancy${queryString}`);
  }

  getExcelFileOflease(params: any): Observable<Blob> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/lease_tenancy_csv${queryString}`,
      {
        responseType: 'blob',
      }
    );
  }

  getLeasePdf(leaseId: number, type?: 'download') {
    let url = `${this.SERVER_ADDRESS}/lease_pdf?lease_id=${leaseId}`;

    if (type === 'download') {
      url += `&purpose=download`;
    }

    return this.http.get(url);
  }

  getLease(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/save/lease${queryString}`);
  }

  addLease(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/save/lease`, data);
  }

  editLease(data: Record<string, any>): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/save/lease`, data);
  }

  addLeasePropertyDetails(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/lease/property/view/`, data);
  }

  editLeasePropertyDetails(data: Record<string, any>): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/lease/property/view/`, data);
  }

  getLeaseCommercialDetails(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/lease/commercials/view/${queryString}`
    );
  }

  addLeaseCommercialDetails(data: Record<string, any>): Observable<any> {
    return this.http.post(
      `${this.SERVER_ADDRESS}/lease/commercials/view/`,
      data
    );
  }

  editLeaseCommercialDetails(data: Record<string, any>): Observable<any> {
    return this.http.put(
      `${this.SERVER_ADDRESS}/lease/commercials/view/`,
      data
    );
  }

  getTemplates(): Observable<any> {
    return this.http.get(`${this.SERVER_ADDRESS}/api/lease/templates`);
  }

  getTemplateFields(templateId: number, leaseId?: number | null): Observable<any> {
    let url = `${this.SERVER_ADDRESS}/api/lease/template-fields?template_id=${templateId}`;
    if (leaseId) url += `&lease_id=${leaseId}`;
    return this.http.get(url);
  }

  getTemplateData(params: Record<string, any>) {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/api/lease/template-fields${queryString}`
    );
  }

  getTemplateContent(url: string): Observable<any> {
    let finalUrl = new URL(url, this.SERVER_ADDRESS);

    return this.http.get(`${finalUrl}`, {
      responseType: 'text',
    });
  }

  addTemplateData(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/api/lease/generate-contract`, data);
  }

  sendNegotiation(leaseId: number): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/api/lease/send-negotiation`, { lease_id: leaseId });
  }

  editTemplateData(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/api/lease/generate-contract`, data);
  }

  addEjariDocuments(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/lease_documents`, data);
  }

  // ── Onboarding Documents ──────────────────────────────────────────────────

  getOnboardingDocuments(leaseId: number): Observable<any> {
    return this.http.get(`${this.SERVER_ADDRESS}/api/lease/onboarding-documents?lease_id=${leaseId}`);
  }

  uploadOnboardingDocuments(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/api/lease/onboarding-documents`, data);
  }

  deleteOnboardingDocument(documentId: number): Observable<any> {
    return this.http.delete(`${this.SERVER_ADDRESS}/api/lease/onboarding-documents?document_id=${documentId}`);
  }

  getTenantDocumentTypes(): Observable<any> {
    return this.http.get(`${this.SERVER_ADDRESS}/options?option_type=TENANT_DOCUMENT_TYPE`);
  }
}
