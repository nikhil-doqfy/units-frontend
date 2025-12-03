import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../shared.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class PmcService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;
  constructor() {}

  //---------------getpmcDetails-----------------------------------------------------------------------------------
  getPmcDetails(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/pmc/owner/view/list${queryString}`
    );
  }

  // getpmcDetails(params:Record<string,any>):Observable<any>{
  //   const queryString = this.sharedService.getQueryString(params);
  //   return this.http.get(
  //     `${this.SERVER_ADDRESS}/pmc/owner/view/list/pmc_id/${query}`
  //   )
  // };
}
