import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private openSidebarValueKey = 'openSidebarValue';
  private openRightSidebarValueKey = 'openRightSidebarValue';

  private openSidebarValueSource = new BehaviorSubject<boolean>(false); // Default to closed
  openSidebarValue$ = this.openSidebarValueSource.asObservable();

  private openRightSidebarValueSource = new BehaviorSubject<boolean>(false);
  openRightSidebarValue$ = this.openRightSidebarValueSource.asObservable();

  constructor() {
    this.initializeSidebarState(); // Initialize the sidebar state properly
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
    localStorage.setItem(this.openRightSidebarValueKey, JSON.stringify(newRightValue));
    this.openRightSidebarValueSource.next(newRightValue);
  }

  // Set the sidebar state per route
  setRightSidebarStateForRoute(route: string) {
    const defaultState = this.getSidebarDefaultState(route);
    localStorage.setItem(this.openRightSidebarValueKey, JSON.stringify(defaultState));
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
}
