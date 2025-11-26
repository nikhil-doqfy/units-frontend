import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private title = inject(Title);
  private translate = inject(TranslateService);
  private openSidebarValueKey = 'openSidebarValue';
  private openRightSidebarValueKey = 'openRightSidebarValue';

  private openSidebarValueSource = new BehaviorSubject<boolean>(false); // Default to closed
  openSidebarValue$ = this.openSidebarValueSource.asObservable();

  private openRightSidebarValueSource = new BehaviorSubject<boolean>(false);
  openRightSidebarValue$ = this.openRightSidebarValueSource.asObservable();
  currentbreadcrumb:
    | { key: string; link?: string }
    | { key: string; link?: string }[] = [];

  breadcrumb$ = new BehaviorSubject<{ label: string; link: string }[]>([]);

  constructor() {
    this.initializeSidebarState(); // Initialize the sidebar state properly
  }

  async getBreadcrumbs(
    items: { key: string; link?: string } | { key: string; link?: string }[]
  ): Promise<{ label: string; link: string }[]> {
    // Convert single object to array
    const list = Array.isArray(items) ? items : [items];
    this.currentbreadcrumb = list;
    const promises = list.map((item) =>
      this.translate
        .get(item.key)
        .toPromise()
        .then((translated) => {
          return { label: translated, link: item.link || '' };
        })
    );
    const translatedList = await Promise.all(promises);

    // 🔥 Emit event so HeaderComponent updates without refresh
    this.breadcrumb$.next(translatedList);

    return translatedList;
    return Promise.all(promises);
  }
  // Detect if the user is on a mobile device
  private isMobile(): boolean {
    return window.innerWidth <= 991; // Adjust breakpoint as needed
  }

  // Initialize the sidebar state based on device type
  private initializeSidebarState(): void {
    if (this.isMobile()) {
      localStorage.setItem(this.openSidebarValueKey, JSON.stringify(false)); // Always closed on mobile
      this.openSidebarValueSource.next(false);
    } else {
      const storedState = localStorage.getItem(this.openSidebarValueKey);
      const sidebarState = storedState ? JSON.parse(storedState) : true; // Default true on desktop
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
      JSON.stringify(newRightValue)
    );
    this.openRightSidebarValueSource.next(newRightValue);
  }

  // Set the sidebar state per route
  setRightSidebarStateForRoute(route: string) {
    const defaultState = this.getSidebarDefaultState(route);
    localStorage.setItem(
      this.openRightSidebarValueKey,
      JSON.stringify(defaultState)
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

  setTitle(key: string) {
    this.translate.get(key).subscribe((translated: string) => {
      this.title.setTitle(`${translated} | Doqfy`);
    });
  }
}
