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
  signupData: Record<string, any> = {};

  constructor(
    private storageService: StorageService,
    private http: HttpClient,
  ) {}

  login(data: any) {
    return this.http
      .post(`${environment.SERVER_ADDRESS}/auth/login`, data)
      .pipe(
        map((resp: any) => {
          this.storageService.setToken(resp['content'].access_token);
          this.storageService.setUserProfile(resp['content']);
          return resp;
        }),
      );
  }

  sendOtp(data: any) {
    return this.http.post(`${environment.SERVER_ADDRESS}/auth/otp/send`, data);
  }

  verifyOtp(data: any) {
    return this.http.post(
      `${environment.SERVER_ADDRESS}/auth/otp/verify`,
      data,
    );
  }

  resetPassword(data: any) {
    return this.http.post(
      `${environment.SERVER_ADDRESS}/auth/password/reset`,
      data,
    );
  }

  changePassword(data: any) {
    return this.http.post(
      `${environment.SERVER_ADDRESS}/auth/change/password`,
      data,
    );
  }

  logout(data: Record<string, any>): Observable<any> {
    return this.http.post(`${environment.SERVER_ADDRESS}/auth/logout`, data);
  }

  signUp(data: Record<string, any>) {
    return this.http.post(`${environment.SERVER_ADDRESS}/user/signup`, data);
  }
}
