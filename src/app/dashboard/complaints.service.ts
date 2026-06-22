import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SharedService } from '../shared.service';
import { Observable } from 'rxjs';
import { StorageService } from '../shared/services/storage.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ComplaintsService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}

  getTickets(params?: { [key: string]: any }): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        if (
          params[key] !== null &&
          params[key] !== undefined &&
          params[key] !== ''
        ) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get(`${this.SERVER_ADDRESS}/complaint`, { params });
  }
  createComplaint(payload: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/complaint`, payload);
  }
  getTicketsDetails(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/admin/tickets/detail/${queryString}`,
    );
  }
  updateComplaint(code: string, payload: any): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/complaint`, {
      ...payload,
      code: code,
    });
  }
  deleteComplaint(code: string): Observable<any> {
    return this.http.delete(`${this.SERVER_ADDRESS}/complaint`, {
      params: {
        code: code,
      },
    });
  }
  getComplaintDetails(code: string): Observable<any> {
    return this.http.get(`${this.SERVER_ADDRESS}/complaint/detail`, {
      params: { code },
    });
  }
  exportPreviousComplaints(params: Record<string, any> = {}): void {
    const queryString = this.sharedService.getQueryString({
      ...params,
      export: 'csv',
    });
    this.http
      .get(`${this.SERVER_ADDRESS}/complaint${queryString}`, {
        responseType: 'blob',
      })
      .subscribe((blob) => {
        this.sharedService.downloadBlob(blob, 'complaints.csv');
      });
  }
}
