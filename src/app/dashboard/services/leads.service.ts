import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SharedService } from '../../shared.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LeadsService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  getLeads(params: Record<string, any> = {}): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/user/create_lead${queryString}`);
  }

  createLead(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/user/create_lead`, data);
  }

  updateLead(leadId: string, data: Record<string, any>): Observable<any> {
    return this.http.put(
      `${this.SERVER_ADDRESS}/user/create_lead?lead_id=${leadId}`,
      data,
    );
  }

  deleteLead(leadId: string): Observable<any> {
    return this.http.delete(
      `${this.SERVER_ADDRESS}/user/create_lead?lead_id=${leadId}`,
    );
  }
}
