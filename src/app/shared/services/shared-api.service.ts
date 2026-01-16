import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SharedService } from '../../shared.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { OptionsParams } from '../model/shared.model';

@Injectable({
  providedIn: 'root',
})
export class SharedApiService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}

  //  -------------------------- Option type -------------------------
  getOptions(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/options${queryString}`);
  }

  getOptionsType(options: OptionsParams[]) {
    const type = options.map((o) => o.param).join(',');
    let params = {};
    options.forEach((o) => (params = { ...params, ...o.params }));

    this.getOptions({ option_type: type, ...params }).subscribe({
      next: (res) => {
        const content = res?.content || {};

        options.forEach((o) => o.setter(content[o.key] || []));
      },
    });
  }
}
