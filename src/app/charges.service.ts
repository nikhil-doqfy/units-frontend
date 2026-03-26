import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChargesService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;
  constructor() {}
  /*---------GET Charges---------*/
  charges(data: Record<string, any>): Observable<any> {
    return this.http.get(
      `${this.SERVER_ADDRESS}/charges/manage_charges/`,
      data,
    );
  }

  /*-------ADD Charges--------*/
  addCharge(payload: any): Observable<any> {
    return this.http.post(
      `${this.SERVER_ADDRESS}/charges/manage_charges/`,
      payload,
    );
  }
  /*----------------------Edit Charges---------------*/
  editCharge(payload: any): Observable<any> {
    return this.http.put(
      `${this.SERVER_ADDRESS}/charges/manage_charges/${payload.charge_id}`,
      payload,
    );
  }
  /*-----------Delete Charges------*/
  deleteCharge(params: any): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);

    return this.http.delete(
      `${this.SERVER_ADDRESS}/charges/manage_charges/${queryString}`,
      params,
    );
  }
}
