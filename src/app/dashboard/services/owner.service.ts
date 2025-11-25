import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SharedService } from '../../shared.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OwnerService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}

  // ------------------------- getOwnerDetails -------------------------
  getOwnerDetails(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/owner/details/list/view${queryString}`
    );
  }

  // ------------------------- addOwnerToInvite -------------------------
  addOwnerToInvite(data: Record<'email', string>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/invite/pmc/owner`, data);
  }
}
