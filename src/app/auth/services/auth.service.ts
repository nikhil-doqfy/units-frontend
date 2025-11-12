import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { StorageService } from '../../shared/services/storage.service';

import { SharedService } from '../../shared.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private storage: StorageService) {}
  login(data: any) {
    console.log('environment.SERVER_ADDRESS:--', environment.SERVER_ADDRESS);
    return this.http.post(`${environment.SERVER_ADDRESS}/auth/login/`, data);
  }

  signup(data: any): Observable<any> {
    return this.http.post(`${environment.SERVER_ADDRESS}/user/signup/`, data);
  }

  sendOtp(data: any) {
    return this.http.post(
      `${environment.SERVER_ADDRESS}/auth/password/otp/send/`,
      data
    );
  }

  // OTP verify
  verifyOtp(data: any) {
    return this.http.post(
      `${environment.SERVER_ADDRESS}/auth/password/otp/verify/`,
      data
    );
  }
  //forget password
  forgetPassword(email: string): Observable<any> {
    return this.http.post(
      `${environment.SERVER_ADDRESS}/auth/forget-password`,
      { email }
    );
  }
  //reset password
  resetPassword(data: any) {
    return this.http.post(
      `${environment.SERVER_ADDRESS}/auth/password/reset/`,
      data
    );
  }
  //logout
  logout(): Observable<any> {
    return this.http.post(`${environment.SERVER_ADDRESS}/auth/logout/`, {});
  }
}
