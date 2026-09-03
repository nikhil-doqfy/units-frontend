import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment.development';
import { SharedService } from './shared.service';
import { HttpClient } from '@angular/common/http';

export interface PolicyContent {
  subtitle: string;
  content: string;
}

@Injectable({
  providedIn: 'root',
})
export class PrivacyPolicyService {
  private http = inject(HttpClient);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}

  getPrivacyPolicy() {
    return this.http.get(`${this.SERVER_ADDRESS}/user/privacy_policy`);
  }

  getPolicyById(id: number) {
    return this.http.get(`${this.SERVER_ADDRESS}/user/privacy_policy?id=${id}`);
  }

  createPolicy(payload: any) {
    return this.http.post(
      `${this.SERVER_ADDRESS}/user/privacy_policy`,
      payload,
    );
  }

  updatePolicy(id: number, payload: any) {
    return this.http.put(`${this.SERVER_ADDRESS}/user/privacy_policy`, payload);
  }
}
