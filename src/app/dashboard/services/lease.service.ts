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
}
