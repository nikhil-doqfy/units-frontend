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
    return this.http.get(`${this.SERVER_ADDRESS}/user/profile${queryString}`);
  }

  editUserProfile(data: Record<string, any>): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/user/profile`, data);
  }

  // ------------------------- Access user service management -------------------------
  accessUserManagement(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/user/management${queryString}`
    );
  }

  // ------------------------- Add new user -------------------------
  addNewUser(data: Record<string, any>): Observable<any> {
    console.log('Adding new user with data:', data);
    return this.http.post(`${this.SERVER_ADDRESS}/user/management`, data);
  }

  // ------------------------- Edit new user -------------------------
  editUserManagement(data: Record<string, any>): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/user/management`, data);
  }

  // ------------------------- Delete user -------------------------
  DeleteUser(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.delete(
      `${this.SERVER_ADDRESS}/user/management${queryString}`
    );
  }

  // ------------------------- User activate -------------------------
  activateUser(data: Record<string, any>): Observable<any> {
    return this.http.put(
      `${this.SERVER_ADDRESS}/user/toggle/user/active`,
      data
    );
  }
}
