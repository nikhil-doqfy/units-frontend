import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SharedService } from '../../shared.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  getUserProfile(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/user/profile/view${queryString}`
    );
  }

  changePassword(data: any) {
    return this.http.post(
      `${environment.SERVER_ADDRESS}/auth/change/password`,
      data
    );
  }

  editUserProfile(data: Record<string, any>): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/user/profile/view/`, data);
  }

  // ------------------------- Access user service management -------------------------
  accessUserManagement(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/user/user/management${queryString}`
    );
  }
}
