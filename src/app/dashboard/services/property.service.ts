import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SharedService } from '../../shared.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}

  getProperties(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/property/details/list/view${queryString}`
    );
  }

  getDashboardStatistics(): Observable<any> {
    return this.http.get(`${this.SERVER_ADDRESS}/property/statistics`);
  }

  addBasicDetailsOfProperty(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/create/property/basic`, data);
  }

  addCommercialDetailsOfProperty(data: Record<string, any>): Observable<any> {
    return this.http.post(
      `${this.SERVER_ADDRESS}/property/commercial/details`,
      data
    );
  }

  addPropertyImages(data: Record<string, any>) {
    return this.http.post(`${this.SERVER_ADDRESS}/property/images/`, data);
  }

  addPropertyDocuments(data: Record<string, any>) {
    return this.http.post(
      `${this.SERVER_ADDRESS}/upload/property/documents`,
      data
    );
  }
}
