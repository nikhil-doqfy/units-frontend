import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RaiseComplaintService {
  private http = inject(HttpClient);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}
  raiseComplaint(message: string) {
    return this.http.post(`${this.SERVER_ADDRESS}/complaint`, { message });
  }
  getFaqList(): Observable<any> {
    return this.http.get(`${this.SERVER_ADDRESS}/faq_api`);
  }
}
