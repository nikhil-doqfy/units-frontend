import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private TOKEN_KEY = 'AuthToken';
  private userKey = 'user_profile';
  private statusKey = 'userRegestrationStatusKey';
  constructor() {}

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setUserProfile(user: any) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUserProfile(): any {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }
  removeToken() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  setCurrentStatus(status: any): void {
    localStorage.setItem(this.statusKey, JSON.stringify(status));
  }

  getCurrentStatus() {
    var status: any = localStorage.getItem(this.statusKey);
    return JSON.parse(status);
  }

  // getUser(): any {
  //   const v = localStorage.getItem(USER_KEY);
  //   return v ? JSON.parse(v) : null;
  // }

  // clear(): void {
  //   localStorage.removeItem(TOKEN_KEY);
  //   localStorage.removeItem(USER_KEY);
  // }
}
