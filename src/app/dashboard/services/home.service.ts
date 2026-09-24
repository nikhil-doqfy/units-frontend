import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SharedService } from '../../shared.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { SelectedPmcService } from './selected-pmc.service';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private selectedPmc = inject(SelectedPmcService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}

  // Every dashboard read goes through this -- merges in the navbar's
  // currently selected PMC (if any) so all dashboard data is scoped to it.
  private withPmc(params?: any): any {
    const pmc = this.selectedPmc.selectedPmc();
    return pmc ? { ...params, pmc_id: pmc.key } : params;
  }

  getDashboardStatistics(params?: any): Observable<any> {
    return this.http.get(`${this.SERVER_ADDRESS}/statistics`, {
      params: this.withPmc(params),
    });
  }

  getMonthlyRevenue(params?: any) {
    return this.http.get<any>(`${this.SERVER_ADDRESS}/monthly_revenue`, {
      params: this.withPmc(params),
    });
  }
  getChequeVisibility(params?: any) {
    return this.http.get<any>(`${this.SERVER_ADDRESS}/cheque_visibility`, {
      params: this.withPmc(params),
    });
  }
  getChequeAging(params?: any): Observable<any> {
    return this.http.get<any>(`${this.SERVER_ADDRESS}/cheque_aging`, {
      params: this.withPmc(params),
    });
  }

  getOtherTypePayments(params?: any): Observable<any> {
    return this.http.get<any>(`${this.SERVER_ADDRESS}/other_type_payments`, {
      params: this.withPmc(params),
    });
  }

  getDashboardGraphDue(params?: any): Observable<any> {
    return this.http.get<any>(`${this.SERVER_ADDRESS}/dashboard_graph_due`, {
      params: this.withPmc(params),
    });
  }
  getDashboardVisualization(params?: any): Observable<any> {
    return this.http.get<any>(
      `${this.SERVER_ADDRESS}/dashboard_visualization`,
      { params: this.withPmc(params) },
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
      { params: this.withPmc(params) },
    );
  }
  getTopRevenueProperties(params?: any): Observable<any> {
    return this.http.get<any>(`${this.SERVER_ADDRESS}/top_revenue_properties`, {
      params: this.withPmc(params),
    });
  }
  getOccupancyData(params?: any): Observable<any> {
    return this.http.get<any>(`${this.SERVER_ADDRESS}/occupancy`, {
      params: this.withPmc(params),
    });
  }
}
