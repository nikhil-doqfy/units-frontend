import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SharedService } from './shared.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TermsConditionService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;
  constructor() {}
  getTerms(): Observable<any> {
    return this.http.get(`${this.SERVER_ADDRESS}/terms/`);
  }
}
