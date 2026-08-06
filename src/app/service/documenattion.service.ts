import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { SharedService } from '../shared.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocumenattionService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;
  constructor() {}

  uploadTenantDocument(payload: any): Observable<any> {
    return this.http.post(
      `${this.SERVER_ADDRESS}/user/tenant_documents`,
      payload,
    );
  }

  getTenantDocumentById(documentId: number): Observable<any> {
    return this.http.get(
      `${this.SERVER_ADDRESS}/user/tenant_documents?document_id=${documentId}`,
    );
  }
  updateTenantDocument(payload: any): Observable<any> {
    return this.http.put(
      `${this.SERVER_ADDRESS}/user/tenant_documents`,
      payload,
    );
  }
  getTenantDocuments(): Observable<any> {
    return this.http.get(`${this.SERVER_ADDRESS}/user/tenant_documents`);
  }
}
