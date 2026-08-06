import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { SharedService } from '../shared.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentAndInvoiceService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}
  getInvoices(): Observable<any> {
    return this.http.get(`${this.SERVER_ADDRESS}/api/lease/invoice`);
  }
}
