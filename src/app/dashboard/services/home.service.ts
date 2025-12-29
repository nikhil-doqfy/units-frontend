import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SharedService } from '../../shared.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}

  getDashboardStatistics(params?: any): Observable<any> {
    return this.http.get(`${this.SERVER_ADDRESS}/statistics`, { params });
  }

  getMonthlyRevenue() {
    return this.http.get<any>(`${this.SERVER_ADDRESS}/monthly_revenue`);
  }
  getChequeVisibility() {
    return this.http.get<any>(`${this.SERVER_ADDRESS}/cheque_visibility`);
  }
  // Fetch cheque aging data (optionally filter by property_unit_id)
  getChequeAging(params?: any): Observable<any> {
    return this.http.get<any>(`${this.SERVER_ADDRESS}/cheque_aging`, {
      params,
    });
  }
}
