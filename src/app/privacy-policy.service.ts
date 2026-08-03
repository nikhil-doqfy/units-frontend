import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment.development';
import { SharedService } from './shared.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PrivacyPolicyService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}

  getPrivacyPolicy() {
    return this.http.get(`${this.SERVER_ADDRESS}/user/privacy_policy`);
  }
}
