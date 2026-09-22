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

  /*----------------------toggle mode --------------------*/
  private THEME_KEY = 'theme';

  setTheme(theme: string): void {
    localStorage.setItem(this.THEME_KEY, theme);
  }

  getTheme(): string {
    return localStorage.getItem(this.THEME_KEY) ?? 'light';
  }

  /*----------------------finance last-selected PMC --------------------*/
  private LAST_FINANCE_PMC_KEY = 'lastFinancePmcId';

  setLastFinancePmcId(id: string): void {
    if (!id) return;
    try {
      localStorage.setItem(this.LAST_FINANCE_PMC_KEY, id);
    } catch {
      // private browsing / quota exceeded — nothing to persist, fail safe
    }
  }

  getLastFinancePmcId(): string | null {
    try {
      return localStorage.getItem(this.LAST_FINANCE_PMC_KEY);
    } catch {
      return null;
    }
  }

  /*----------------------logged in company / default PMC --------------------*/
  getLoggedInCompanyId(): number | string | null {
    const user = this.getUserProfile();
    if (!user) return null;
    return (
      user.company_id ??
      user.company?.company_id ??
      user.company?.id ??
      user.company?.key ??
      user.pmc_id ??
      user.pmc?.id ??
      user.pmc?.key ??
      user.company_profile?.company_id ??
      user.company_profile?.id ??
      null
    );
  }

  getLoggedInCompanyName(): string | null {
    const user = this.getUserProfile();
    if (!user) return null;
    return (
      user.company_name ??
      user.company?.company_name ??
      user.company?.name ??
      user.company?.value ??
      user.pmc_name ??
      user.pmc?.name ??
      user.company_profile?.company_name ??
      null
    );
  }

  getDefaultPmc(pmcList: any[]): any {
    if (!pmcList || !pmcList.length) return null;
    const companyId = this.getLoggedInCompanyId();
    const companyName = this.getLoggedInCompanyName()?.toLowerCase().trim();

    if (companyId != null) {
      const match = pmcList.find(
        (p: any) =>
          String(p.key) === String(companyId) ||
          String(p.id) === String(companyId) ||
          String(p.company_id) === String(companyId),
      );
      if (match) return match;
    }

    if (companyName) {
      const match = pmcList.find((p: any) => {
        const val = (p.value || p.name || p.company_name || '')
          .toLowerCase()
          .trim();
        return (
          val &&
          (val === companyName ||
            val.includes(companyName) ||
            companyName.includes(val))
        );
      });
      if (match) return match;
    }

    const lastFinancePmcId = this.getLastFinancePmcId();
    if (lastFinancePmcId) {
      const match = pmcList.find(
        (p: any) =>
          String(p.key) === String(lastFinancePmcId) ||
          String(p.id) === String(lastFinancePmcId),
      );
      if (match) return match;
    }

    if (pmcList.length === 1) {
      return pmcList[0];
    }

    return pmcList[0] || null;
  }
}
