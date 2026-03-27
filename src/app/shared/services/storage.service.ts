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

  saveUserProfile(profile: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(profile));
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
}
