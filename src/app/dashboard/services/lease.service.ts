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

  getLeasePropertyDetails(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/lease/property/view/${queryString}`
    );
  }

  getExcelFileOflease(params: any): Observable<Blob> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/export/lease/tenecy/csv${queryString}`,
      {
        responseType: 'blob',
      }
    );
  }

  // getLeasePdf(leaseId: number, type?: 'download') {
  //   let url = `${this.SERVER_ADDRESS}/get/lease/pdf?lease_id=${leaseId}`;

  //   if (type === 'download') {
  //     url += `&type=download`;
  //   }

  //   return this.http.get(url, {
  //     responseType: 'blob', // ✅ IMPORTANT
  //   });
  // }

  getLeasePdf(leaseId: number, type?: 'download') {
    let url = `${this.SERVER_ADDRESS}/get/lease/pdf?lease_id=${leaseId}`;

    if (type === 'download') {
      url += `&type=download`;
    }

    // remove responseType: 'blob', take JSON
    return this.http.get(url); // JSON response expected
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

  getTemplateData(params: Record<string, any>) {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/get/template/fields/${queryString}`
    );
  }

  getTemplateContent(url: string): Observable<any> {
    let finalUrl = new URL(url, this.SERVER_ADDRESS);

    return this.http.get(`${finalUrl}`, {
      responseType: 'text',
    });
  }

  addTemplateData(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/save/template`, data);
  }

  editTemplateData(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/save/template`, data);
  }
}
