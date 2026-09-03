import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}

  createAnnouncement(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/broadcast`, data);
  }
  getAnnouncements(params?: Record<string, any>): Observable<any> {
    return this.http.get(`${this.SERVER_ADDRESS}/broadcast`, { params });
  }

  resendBroadcast(id: number): Observable<any> {
    return this.http.post(
      `${this.SERVER_ADDRESS}/broadcast/${id}/resend-failed`,
      {},
    );
  }

  exportAnnouncement(params: Record<string, any> = {}): Observable<Blob> {
    const queryString = this.sharedService.getQueryString({
      ...params,
      export: 'csv',
    });
    return this.http.get(
      `${this.SERVER_ADDRESS}/broadcast/export${queryString}`,
      {
        responseType: 'blob',
      },
    );
  }
}
