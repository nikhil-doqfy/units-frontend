import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor() {}
  private messageSource = new Subject<string>();
  message$ = this.messageSource.asObservable();

  show(message: string) {
    this.messageSource.next(message);
  }
}
