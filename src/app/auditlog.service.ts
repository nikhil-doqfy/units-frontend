import { inject, Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuditlogService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;
  constructor() {}
  getAuditLog(params: Record<string, any> = {}): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/audit_log${queryString}`);
  }

  exportAuditLog(params: Record<string, any> = {}): Observable<Blob> {
    const queryString = this.sharedService.getQueryString({
      ...params,
      export: 'true',
    });
    return this.http.get(`${this.SERVER_ADDRESS}/audit_log${queryString}`, {
      responseType: 'blob',
    });
  }
}
