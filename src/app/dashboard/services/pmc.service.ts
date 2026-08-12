import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SharedService } from '../../shared.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PmcService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}

  getPMC(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/owner/pmc${queryString}`);
  }
  // ------------------------- getOwnerDetails -------------------------
  // getPmcDetails(params: Record<string, any>): Observable<any> {
  //   const queryString = this.sharedService.getQueryString(params);
  //   return this.http.get(`${this.SERVER_ADDRESS}/owner/pmc${queryString}`);
  // }
  editPMC(data: Record<string, any>): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/owner/pmc`, data);
  }

  getExcelFileOfPmc(params: any): Observable<Blob> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/owner_compnay_csv${queryString}`,
      {
        responseType: 'blob',
      },
    );
  }
  addPmcToInvite(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/user/invite-pm`, data);
  }
}
