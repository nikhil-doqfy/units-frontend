import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../shared.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ApprovalService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}
  // ------------------------- getApprovalList -------------------------
  // getApprovalList(params: Record<string, any>): Observable<any> {
  //   const queryString = this.sharedService.getQueryString(params);
  //   return this.http.get(
  //     `${this.SERVER_ADDRESS}/pmc/approval/list${queryString}`
  //   );
  // }

  getApprovalList(
    params: Record<string, any>,
    method: 'GET' | 'PUT' = 'GET'
  ): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);

    if (method === 'GET') {
      return this.http.get(
        `${this.SERVER_ADDRESS}/pmc/approval/list${queryString}`
      );
    } else {
      // PUT method for approve/reject
      return this.http.put(`${this.SERVER_ADDRESS}/pmc/approval/list`, params);
    }
  }
}
