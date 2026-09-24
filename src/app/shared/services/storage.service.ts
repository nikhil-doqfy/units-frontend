import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private TOKEN_KEY = 'AuthToken';
  private USER_KEY = 'user_profile';
  private STATUS_KEY = 'userRegestrationStatusKey';
  private LANGUAGE = 'language';
  private USER_ROLE = 'userRole';
  constructor() {}

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Merges into the cached profile rather than replacing it -- callers here
  // (e.g. My Profile's save-partial-fields flow) only ever pass a subset of
  // fields, and a wholesale overwrite used to wipe out `permissions` and
  // `user_role`, silently hiding sidebar items/routes until the next full
  // profile refetch (header.component.ts) overwrote it back.
  saveUserProfile(profile: any): void {
    const existing = this.getUserProfile() ?? {};
    localStorage.setItem(this.USER_KEY, JSON.stringify({ ...existing, ...profile }));
  }

  updateUserName(firstName: string, lastName: string): void {
    const user = this.getUserProfile();
    if (user) {
      user.first_name = firstName;
      user.last_name = lastName;

      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  setUserProfile(user: any) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUserProfile(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  getUserRole(): string | null {
    return localStorage.getItem(this.USER_ROLE);
  }

  removeToken() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  setCurrentStatus(status: any): void {
    localStorage.setItem(this.STATUS_KEY, JSON.stringify(status));
  }

  getCurrentStatus() {
    var status: any = localStorage.getItem(this.STATUS_KEY);
    return JSON.parse(status);
  }

  setLanguage(language: string): void {
    localStorage.setItem(this.LANGUAGE, language);
  }

  getLanguage(): string {
    return localStorage.getItem(this.LANGUAGE) ?? 'en';
  }

  /*----------------------toggle mode --------------------*/
  private THEME_KEY = 'theme';

  setTheme(theme: string): void {
    localStorage.setItem(this.THEME_KEY, theme);
  }

  getTheme(): string {
    return localStorage.getItem(this.THEME_KEY) ?? 'light';
  }

  /*----------------------navbar selected PMC --------------------*/
  private SELECTED_PMC_KEY = 'selectedPmcId';

  setSelectedPmcId(id: string): void {
    try {
      localStorage.setItem(this.SELECTED_PMC_KEY, id);
    } catch {
      // private browsing / quota exceeded — nothing to persist, fail safe
    }
  }

  getSelectedPmcId(): string | null {
    try {
      return localStorage.getItem(this.SELECTED_PMC_KEY);
    } catch {
      return null;
    }
  }
}
