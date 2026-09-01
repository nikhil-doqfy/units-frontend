import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { SharedService } from '../shared.service';

@Injectable({
  providedIn: 'root',
})
export class RaiseComplaintService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}
  raiseComplaint(description: string) {
    return this.http.post(`${this.SERVER_ADDRESS}/support-ticket`, {
      description,
    });
  }
  getFaqList(): Observable<any> {
    return this.http.get(`${this.SERVER_ADDRESS}/faq_api`);
  }

  getSupportTickets(params: Record<string, any> = {}): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/support-ticket${queryString}`);
  }

  getSupportTicketDetail(ticketId: number | string): Observable<any> {
    return this.http.get(`${this.SERVER_ADDRESS}/support-ticket`, {
      params: new HttpParams().set('ticket_id', String(ticketId)),
    });
  }
  replyToSupportTicket(
    ticketId: number | string,
    message: string,
  ): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/support-ticket/reply`, {
      ticket_id: ticketId,
      message,
    });
  }
}
