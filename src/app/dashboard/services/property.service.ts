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
      `${this.SERVER_ADDRESS}/property/details/list/view/${queryString}`
    );
  }

  getBasicDetails(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/create/property/basic${queryString}`
    );
  }

  addBasicDetailsOfProperty(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/create/property/basic`, data);
  }

  editBasicDetailsOfProperty(data: Record<string, any>): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/create/property/basic`, data);
  }

  getCommercialDetails(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/property/commercial/details${queryString}`
    );
  }

  addCommercialDetailsOfProperty(data: Record<string, any>): Observable<any> {
    return this.http.post(
      `${this.SERVER_ADDRESS}/property/commercial/details`,
      data
    );
  }

  editCommercialDetailsOfProperty(data: Record<string, any>): Observable<any> {
    return this.http.put(
      `${this.SERVER_ADDRESS}/property/commercial/details`,
      data
    );
  }

  getPropertyImages(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/property/images/${queryString}`
    );
  }

  addPropertyImages(data: Record<string, any>) {
    return this.http.post(`${this.SERVER_ADDRESS}/property/images/`, data);
  }

  editPropertyImages(data: Record<string, any>) {
    return this.http.put(`${this.SERVER_ADDRESS}/property/images/`, data);
  }

  getPropertyDocuments(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/property/documents/view${queryString}`
    );
  }

  addPropertyDocuments(data: Record<string, any>) {
    return this.http.post(
      `${this.SERVER_ADDRESS}/property/documents/view`,
      data
    );
  }

  editPropertyDocuments(data: Record<string, any>) {
    return this.http.put(
      `${this.SERVER_ADDRESS}/property/documents/view`,
      data
    );
  }

  getExcelFileOfProperty(data: Record<string, any>) {
    return this.http.get(`${this.SERVER_ADDRESS}/export/property/csv`, {
      responseType: 'blob',
    });
  }
}
