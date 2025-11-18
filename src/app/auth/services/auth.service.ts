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
  constructor(
    private storageService: StorageService,
    private http: HttpClient,
    private storage: StorageService
  ) {}
  login(data: any) {
    return this.http
      .post(`${environment.SERVER_ADDRESS}/auth/login/`, data)
      .pipe(
        map((resp: any) => {
          this.storageService.setToken(resp['content'].access_token);
          this.storageService.setUserProfile(resp['content']);
          return resp;
        })
      );
  }
  refreshToken(refreshToken: string) {
    return this.http.post<{ accessToken: string }>('/api/auth/refresh', {
      refreshToken,
    });
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

  verifyOtp(data: any) {
    return this.http.post(
      `${environment.SERVER_ADDRESS}/auth/password/otp/verify/`,
      data
    );
  }

  resetPassword(data: any) {
    return this.http.post(
      `${environment.SERVER_ADDRESS}/auth/password/reset/`,
      data
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${environment.SERVER_ADDRESS}/auth/logout/`, {});
  }
}
