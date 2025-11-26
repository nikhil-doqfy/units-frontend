import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SharedService } from '../../shared.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TenantsService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}

  getTenants(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/tenant/list/view${queryString}`
    );
  }

  getTenantDetails(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/tenant/details/${queryString}`
    );
  }

  addTenantToInvite(data: Record<'email', string>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/invite/tenant/pmc`, data);
  }

  addTenant(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/tenant/details/`, data);
  }
}
