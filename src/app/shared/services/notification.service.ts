import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);
  private readonly BASE = `${environment.SERVER_ADDRESS}/notification`;

  /** GET /notification  — returns all / filtered notifications */
  getNotifications(params: Record<string, any> = {}): Observable<any> {
    const qs = this.buildQueryString(params);
    return this.http.get(`${this.BASE}${qs}`);
  }

  /** PUT /notification/read/  — mark a single notification as read */
  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.BASE}/read/`, {
      notification_id: notificationId,
    });
  }

  /** DELETE /notification?clear_notification_id=<id>  — clear (soft-delete) one */
  clearOne(notificationId: number): Observable<any> {
    return this.http.delete(
      `${this.BASE}?clear_notification_id=${notificationId}`,
    );
  }

  /** DELETE /notification?notification_id=<id>  — hard-delete one */
  deleteOne(notificationId: number): Observable<any> {
    return this.http.delete(`${this.BASE}?notification_id=${notificationId}`);
  }

  /** DELETE /notification?clear_all=true  — clear all notifications */
  clearAll(): Observable<any> {
    return this.http.delete(`${this.BASE}?clear_all=true`);
  }

  private buildQueryString(params: Record<string, any>): string {
    const keys = Object.keys(params);
    if (!keys.length) return '';
    return '?' + keys.map((k) => `${k}=${params[k]}`).join('&');
  }
}
