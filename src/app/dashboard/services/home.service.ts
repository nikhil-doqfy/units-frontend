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

  getMonthlyRevenue(params?: any) {
    return this.http.get<any>(`${this.SERVER_ADDRESS}/monthly_revenue`, {
      params,
    });
  }
  getChequeVisibility(params?: any) {
    return this.http.get<any>(`${this.SERVER_ADDRESS}/cheque_visibility`, {
      params,
    });
  }
  getChequeAging(params?: any): Observable<any> {
    return this.http.get<any>(`${this.SERVER_ADDRESS}/cheque_aging`, {
      params,
    });
  }

  getOtherTypePayments(params?: any): Observable<any> {
    return this.http.get<any>(`${this.SERVER_ADDRESS}/other_type_payments`, {
      params,
    });
  }

  getDashboardGraphDue(params?: any): Observable<any> {
    return this.http.get<any>(`${this.SERVER_ADDRESS}/dashboard_graph_due`, {
      params,
    });
  }
  getDashboardVisualization(params?: any): Observable<any> {
    return this.http.get<any>(
      `${this.SERVER_ADDRESS}/dashboard_visualization`,
      { params },
    );
  }
  saveDashboardVisualization(payload: any) {
    return this.http.post(
      `${this.SERVER_ADDRESS}/dashboard_visualization`,
      payload,
    );
  }

  getDashboardPropertyOwned(params?: any): Observable<any> {
    return this.http.get<any>(
      `${this.SERVER_ADDRESS}/dashboard_property_owned`,
      { params },
    );
  }
}
