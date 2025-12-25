import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SharedService } from '../../shared.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StaffService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}

  getExcelFileOfStaff(params: any): Observable<Blob> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/export/staff/csv${queryString}`,
      {
        responseType: 'blob',
      }
    );
  }

  addNewStaff(data: Record<string, any>): Observable<any> {
    console.log('Adding new user with data:', data);
    return this.http.post(`${this.SERVER_ADDRESS}/user/staff_view`, data);
  }
  editUserStaff(data: Record<string, any>): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/user/staff_view`, data);
  }
  // ------------------------- Access staff role details -------------------------
  accessStaffRoleDetails(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/user/staff_view${queryString}`
    );
  }
}
