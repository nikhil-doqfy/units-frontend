import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, forkJoin, map, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { BreadCrumb } from './shared/model/shared.model';
import { StorageService } from './shared/services/storage.service';
@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private title = inject(Title);
  private translate = inject(TranslateService);
  private openSidebarValueKey = 'openSidebarValue';
  private openRightSidebarValueKey = 'openRightSidebarValue';
  private showDetailSource = new BehaviorSubject<boolean>(false);

  private storageService = inject(StorageService);

  private openSidebarValueSource = new BehaviorSubject<boolean>(false); // Default to closed
  openSidebarValue$ = this.openSidebarValueSource.asObservable();

  private openRightSidebarValueSource = new BehaviorSubject<boolean>(false);
  openRightSidebarValue$ = this.openRightSidebarValueSource.asObservable();
  currentbreadcrumb: BreadCrumb[] = [];

  breadcrumb$ = new BehaviorSubject<{ label: string; link: string }[]>([]);
  http: any;

  constructor() {
    const lang = this.getCurrentLanguage();
    this.translate.setDefaultLang('en');
    this.translate.use(lang);
    this.setDirection(lang);
    this.initializeSidebarState();
  }

  getBreadcrumbs(crumbs: BreadCrumb[]) {
    this.currentbreadcrumb = crumbs;

    return forkJoin(
      crumbs.map((crumb) =>
        this.translate.get(crumb.label).pipe(
          map((translated) => ({
            label: translated,
            link: crumb.link,
          })),
        ),
      ),
    ).pipe(tap((translatedList) => this.breadcrumb$.next(translatedList)));
  }

  private isMobile(): boolean {
    return window.innerWidth <= 991;
  }

  private initializeSidebarState(): void {
    if (this.isMobile()) {
      localStorage.setItem(this.openSidebarValueKey, JSON.stringify(false));
      this.openSidebarValueSource.next(false);
    } else {
      const storedState = localStorage.getItem(this.openSidebarValueKey);
      const sidebarState = storedState ? JSON.parse(storedState) : true;
      this.openSidebarValueSource.next(sidebarState);
    }
  }

  // Toggle the sidebar open/close
  toggleSidebar() {
    const currentValue = this.openSidebarValueSource.value;
    const newValue = !currentValue;
    localStorage.setItem(this.openSidebarValueKey, JSON.stringify(newValue));
    this.openSidebarValueSource.next(newValue);
  }

  // Get the initial state of the right sidebar
  private getInitialRightSidebarState(): boolean {
    const storedState = localStorage.getItem(this.openRightSidebarValueKey);
    return storedState ? JSON.parse(storedState) : false; // Default to false (closed)
  }

  // Toggle the right sidebar
  toggleRightSidebar() {
    const currentRightValue = this.openRightSidebarValueSource.value;
    const newRightValue = !currentRightValue;
    localStorage.setItem(
      this.openRightSidebarValueKey,
      JSON.stringify(newRightValue),
    );
    this.openRightSidebarValueSource.next(newRightValue);
  }

  // Set the sidebar state per route
  setRightSidebarStateForRoute(route: string) {
    const defaultState = this.getSidebarDefaultState(route);
    localStorage.setItem(
      this.openRightSidebarValueKey,
      JSON.stringify(defaultState),
    );
    this.openRightSidebarValueSource.next(defaultState);
  }

  // Define default sidebar state for specific routes (default closed on mobile)
  private getSidebarDefaultState(route: string): boolean {
    if (this.isMobile()) {
      return false; // Always closed on mobile
    }

    // Default state based on route (only applies for desktop)
    if (route.includes('home') || route.includes('account-status')) {
      return false; // Default to closed
    }

    return true; // Default to open for other routes
  }

  getQueryString(params: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) return '';

    const query = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    return `?${query}`;
  }

  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  setTitle(key: string) {
    this.translate.stream(key).subscribe((translated: string) => {
      this.title.setTitle(`${translated} | Units`);
    });
  }

  getObjectToEpoch(date: { year: number; month: number; day: number }): number {
    return new Date(date.year, date.month - 1, date.day).getTime();
  }

  getEpochToObject(epoch: number) {
    const date = new Date(epoch);

    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }

  //------------------notification----------------------------------------------------

  getNotifications(queryParams: any) {
    var queryString = this.getQueryString(queryParams);
    return this.http.get(
      `${environment.SERVER_ADDRESS}/notifications/` + queryString,
    );
  }
  readNotification(data: any) {
    return this.http.put(
      `${environment.SERVER_ADDRESS}/notifications/read/`,
      data,
    );
  }
  deleteNotification(queryParams: any) {
    var queryString = this.getQueryString(queryParams);
    return this.http.delete(
      `${environment.SERVER_ADDRESS}/notifications/` + queryString,
    );
  }

  showDetail$ = this.showDetailSource.asObservable();
  showDetails() {
    this.showDetailSource.next(true);
  }

  hideDetails() {
    this.showDetailSource.next(false);
  }

  //--------------------------language trasnlate----------------------------------------------

  private currentLang = new BehaviorSubject<string>(
    this.storageService.getLanguage() || 'en',
  );

  lang$ = this.currentLang.asObservable();

  initLanguage() {
    const lang = this.storageService.getLanguage() || 'en';
    this.translate.setDefaultLang('en');
    this.translate.use(lang);
    this.currentLang.next(lang);
    this.setDirection(lang);
  }
  setLanguage(lang: string) {
    this.storageService.setLanguage(lang);
    this.translate.use(lang);
    this.currentLang.next(lang);

    this.setDirection(lang);
  }

  getCurrentLanguage(): string {
    return this.currentLang.value;
  }

  private setDirection(lang: string) {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
  }
}
