import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CustomSelectService {
  private openDropdownSubject = new Subject<any>();
  openDropdown$ = this.openDropdownSubject.asObservable();

  notifyOpen(component: any) {
    this.openDropdownSubject.next(component);
  }
}
