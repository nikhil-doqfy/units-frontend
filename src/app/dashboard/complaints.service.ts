import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SharedService } from '../shared.service';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { StorageService } from '../shared/services/storage.service';

@Injectable({
  providedIn: 'root',
})
export class ComplaintsService {
  private http = inject(HttpClient);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}

  getComplanints(params?: { [key: string]: any }): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        if (
          params[key] !== null &&
          params[key] !== undefined &&
          params[key] !== ''
        ) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get(`${this.SERVER_ADDRESS}/complaint`, { params });
  }
}
