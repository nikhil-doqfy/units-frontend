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

  charges(params: Record<string, any> = {}): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/charges${queryString}`);
  }

  addCharge(payload: any): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/charges`, payload);
  }

  editCharge(payload: any): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/charges`, payload);
  }

  deleteCharge(params: any): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.delete(`${this.SERVER_ADDRESS}/charges${queryString}`);
  }
}
