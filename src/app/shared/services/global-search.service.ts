import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from '../../shared.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GlobalSearchService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  search(query: string): Observable<any> {
    const queryString = this.sharedService.getQueryString({ search: query });
    return this.http.get(`${this.SERVER_ADDRESS}/global_search${queryString}`);
  }
}
