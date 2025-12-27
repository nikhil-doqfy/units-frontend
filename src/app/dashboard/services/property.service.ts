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
      `${this.SERVER_ADDRESS}/property/details${queryString}`
    );
  }

  getProperty(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/save/property${queryString}`);
  }

  addProperty(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/save/property`, data);
  }

  editProperty(data: Record<string, any>): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/save/property`, data);
  }

  getPropertyImages(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/property/images${queryString}`
    );
  }

  addPropertyImages(data: Record<string, any>) {
    return this.http.post(`${this.SERVER_ADDRESS}/property/images`, data);
  }

  editPropertyImages(data: Record<string, any>) {
    return this.http.put(`${this.SERVER_ADDRESS}/property/images`, data);
  }

  getPropertyDocuments(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/property/documents${queryString}`
    );
  }

  addPropertyDocuments(data: Record<string, any>) {
    return this.http.post(`${this.SERVER_ADDRESS}/property/documents`, data);
  }

  editPropertyDocuments(data: Record<string, any>) {
    return this.http.put(`${this.SERVER_ADDRESS}/property/documents`, data);
  }

  getExcelFileOfProperty(data: Record<string, any>) {
    return this.http.get(`${this.SERVER_ADDRESS}/export/property`, {
      responseType: 'blob',
    });
  }

  getParentPropertyData(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/parent/property${queryString}`
    );
  }
}
