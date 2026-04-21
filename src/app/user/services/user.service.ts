import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SharedService } from '../../shared.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  private profileUpdatedSubject = new BehaviorSubject<any>(null);
  profileUpdated$ = this.profileUpdatedSubject.asObservable();

  notifyProfileUpdated(profile: any) {
    this.profileUpdatedSubject.next(profile);
  }

  getUserProfile(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/user/profile${queryString}`);
  }

  editUserProfile(data: Record<string, any>): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/user/profile`, data);
  }

  // ------------------------- Access user service management -------------------------
  accessUserManagement(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(
      `${this.SERVER_ADDRESS}/user/management${queryString}`
    );
  }

  // ------------------------- Add new user -------------------------
  addNewUser(data: Record<string, any>): Observable<any> {
    console.log('Adding new user with data:', data);
    return this.http.post(`${this.SERVER_ADDRESS}/user/management`, data);
  }

  // ------------------------- Edit new user -------------------------
  editUserManagement(data: Record<string, any>): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/user/management`, data);
  }

  // ------------------------- Delete user -------------------------
  DeleteUser(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.delete(
      `${this.SERVER_ADDRESS}/user/management${queryString}`
    );
  }

  // ------------------------- User activate -------------------------
  activateUser(data: Record<string, any>): Observable<any> {
    return this.http.put(
      `${this.SERVER_ADDRESS}/user/toggle/user/active`,
      data
    );
  }

  // ------------------------- Staff methods -------------------------
  getStaffList(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/user/staff_view${queryString}`);
  }

  addNewStaff(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/user/staff_view`, data);
  }

  editStaff(data: Record<string, any>): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/user/staff_view`, data);
  }

  resetUserPassword(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/user/reset_password`, data);
  }

  shareProfile(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/user/share_profile`, data);
  }

  getStaffCsv(params: Record<string, any>): Observable<Blob> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/user/staff_csv${queryString}`, {
      responseType: 'blob',
    });
  }
}
