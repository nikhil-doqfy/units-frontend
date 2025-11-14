import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type UserRole = 'owner' | 'property-manager' | 'tenant';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private roleSubject = new BehaviorSubject<UserRole>('owner');
  currentRole$ = this.roleSubject.asObservable();

  constructor() {
    const savedRole = localStorage.getItem('userRole') as UserRole;
    if (savedRole) this.setRole(savedRole);
  }

  setRole(role: UserRole): void {
    this.roleSubject.next(role);
    localStorage.setItem('userRole', role);
    this.applyTheme(role);
  }

  getRole(): UserRole {
    return this.roleSubject.value;
  }

  private applyTheme(role: UserRole): void {
    document.body.classList.remove('theme-owner', 'theme-manager', 'theme-tenant');
    switch (role) {
      case 'owner':
        document.body.classList.add('theme-owner');
        break;
      case 'property-manager':
        document.body.classList.add('theme-manager');
        break;
      case 'tenant':
        document.body.classList.add('theme-tenant');
        break;
    }
  }
}
