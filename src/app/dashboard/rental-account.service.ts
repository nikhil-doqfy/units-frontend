import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SharedService } from '../shared.service';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RentalAccountService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}
  getOwnerRentAmounts(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/payment/owner_rent_amounts${queryString}`
    );
  }
  getLeaseDetailsById(leaseId: number): Observable<any> {
    return this.http.get(
      `${this.SERVER_ADDRESS}/payment/access_rental_account/`,
      {
        params: { lease_id: leaseId },
      }
    );
  }

  getRentalPayments(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/payment/rental_payments/${queryString}`
    );
  }
}
