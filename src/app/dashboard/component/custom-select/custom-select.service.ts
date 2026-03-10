import { Injectable, Input } from '@angular/core';
import { Subject } from 'rxjs';

import { CustomSelectComponent } from './custom-select.component';

@Injectable({ providedIn: 'root' })
export class CustomSelectService {
  private openDropdownSubject = new Subject<CustomSelectComponent>();
  openDropdown$ = this.openDropdownSubject.asObservable();

  notifyOpen(component: CustomSelectComponent) {
    this.openDropdownSubject.next(component);
  }
}
