import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { SharedService } from '../../../shared.service';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dash-body',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './dash-body.component.html',
  styleUrls: ['./dash-body.component.css']
})
export class DashBodyComponent implements OnInit, OnDestroy {
  currentRoute: string = '';
  openSidebarValue = true;
  openRightSidebarValue = false;
  hasRightSidebar = false;  // New flag to track right sidebar
  currentLanguage = 'en';

  private subscriptions = new Subscription();

  constructor(
    private sharedService: SharedService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService
  ) {
    this.translate.onLangChange.subscribe((event:any) => {
      this.currentLanguage = event.lang;
    });
    translate.use('en');
  }

  ngOnInit() {
    // Initial check for sidebar on page load
    this.checkForRightSidebar();

    // Track route changes to update the right sidebar state
    this.subscriptions.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.checkForRightSidebar();

        // Set the right sidebar state for the current route
        this.sharedService.setRightSidebarStateForRoute(this.router.url);
      })
    );

    // Subscribe to the shared service for sidebar states
    this.subscriptions.add(
      this.sharedService.openSidebarValue$.subscribe(value => {
        this.openSidebarValue = value;
      })
    );

    this.subscriptions.add(
      this.sharedService.openRightSidebarValue$.subscribe(value => {
        this.openRightSidebarValue = value;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // Check if the route should have a right sidebar
  checkForRightSidebar() {
    const route = this.router.url;
    this.hasRightSidebar = route.includes('account-status') || route.includes('payment-invoice') || route.includes('calendar');
  }
}
