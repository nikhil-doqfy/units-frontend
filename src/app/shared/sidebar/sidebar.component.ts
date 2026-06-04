import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, of } from 'rxjs';
import {
  filter,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { ThemeService, UserRole } from '../../theme.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SharedService } from '../../shared.service';
import { PermissionService } from '../../services/permission.service';
import { GlobalSearchService } from '../services/global-search.service';

import { MenuOpenIconComponent } from '../component/icons/menu-open-icon/menu-open-icon.component';
import { MenuCloseIconComponent } from '../component/icons/menu-close-icon/menu-close-icon.component';
import { SearchIconComponent } from '../component/icons/search-icon/search-icon.component';
import { SidebarHeadingComponent } from './sidebar-heading/sidebar-heading.component';
import { SidebarItemComponent } from './sidebar-item/sidebar-item.component';
import { DashboardIconComponent } from '../component/icons/dashboard-icon/dashboard-icon.component';
import { PropertyIconComponent } from '../component/icons/property-icon/property-icon.component';
import { TenantIconComponent } from '../component/icons/tenant-icon/tenant-icon.component';
import { PMCIconComponent } from '../component/icons/pmc-icon/pmc-icon.component';
import { LeaseTenancyIconComponent } from '../component/icons/lease-tenancy-icon/lease-tenancy-icon.component';
import { OwnerIconComponent } from '../component/icons/owner-icon/owner-icon.component';
import { ApprovalIconComponent } from '../component/icons/approval-icon/approval-icon.component';
import { StaffIconComponent } from '../component/icons/staff-icon/staff-icon.component';
import { RolesPermissionsIconComponent } from '../component/icons/roles-permissions-icon/roles-permissions-icon.component';
import { DocumentationIconComponent } from '../component/icons/documentation-icon/documentation-icon.component';
import { PaymentInvoiceIconComponent } from '../component/icons/payment-invoice-icon/payment-invoice-icon.component';
import { RaiseComplaintIconComponent } from '../component/icons/raise-complaint-icon/raise-complaint-icon.component';
import { PrivacyPolicyIconComponent } from '../component/icons/privacy-policy-icon/privacy-policy-icon.component';
import { SidebarSupportComponent } from './sidebar-support/sidebar-support.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RentalIconComponent } from '../component/icons/rental-icon/rental-icon.component';
import { RentalPortfolioIconComponent } from '../../icons/rental-portfolio-icon/rental-portfolio-icon.component';
import { ChequesIconComponent } from '../../icons/cheques-icon/cheques-icon.component';
import { AnnouncementsComponent } from '../../dashboard/pages/announcements/announcements.component';
import { AnnouncementsIconComponent } from '../../icons/announcements-icon/announcements-icon.component';
import { LeadIconComponent } from '../../icon/lead-icon/lead-icon.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MenuOpenIconComponent,
    MenuCloseIconComponent,
    SearchIconComponent,
    SidebarHeadingComponent,
    SidebarItemComponent,
    DashboardIconComponent,
    PropertyIconComponent,
    PMCIconComponent,
    TenantIconComponent,
    LeaseTenancyIconComponent,
    OwnerIconComponent,
    ApprovalIconComponent,
    StaffIconComponent,
    RolesPermissionsIconComponent,
    DocumentationIconComponent,
    PaymentInvoiceIconComponent,
    RaiseComplaintIconComponent,
    PrivacyPolicyIconComponent,
    SidebarSupportComponent,
    TranslateModule,
    RentalIconComponent,
    RentalPortfolioIconComponent,
    ChequesIconComponent,
    AnnouncementsComponent,
    AnnouncementsIconComponent,
    LeadIconComponent,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private globalSearchService = inject(GlobalSearchService);
  private el = inject(ElementRef);

  currentRole: UserRole = 'owner';
  selected: string = '';
  openSidebarValue = true;
  currentRoute: string = '/';
  currentLanguage = 'en';
  complaintCount = 0;
  searchQuery = '';
  searchResults: any[] = [];
  isSearching = false;
  showSearchDropdown = false;
  private searchSubject = new Subject<string>();

  private readonly routeMap: Record<string, (id: number) => string> = {
    property: (id) => `/dashboard/properties/${id}`,
    unit: (id) => `/dashboard/units/${id}`,
    owner: (id) => `/dashboard/owners/detail/${id}`,
    tenant: (id) => `/dashboard/tenants/detail/${id}`,
  };

  constructor(
    private sharedService: SharedService,
    private router: Router,
    private themeService: ThemeService,
    private translate: TranslateService,
    private permissionService: PermissionService,
  ) {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
        this.closeSearch();
        if (event.id !== 1 && window.innerWidth <= 767) {
          this.sharedService.toggleSidebar();
        }
      });
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event: any) => {
        this.currentLanguage = event.lang;
      });
    translate.use('en');
  }

  ngOnInit() {
    this.sharedService.complaintCount$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((count) => {
        this.complaintCount = count;
      });

    this.sharedService.openSidebarValue$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.openSidebarValue = value;
      });

    this.themeService.currentRole$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((role) => {
        this.currentRole = role;
      });

    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => {
          if (!q || q.length < 2) {
            this.searchResults = [];
            this.showSearchDropdown = false;
            this.isSearching = false;
            return of(null);
          }
          this.isSearching = true;
          return this.globalSearchService.search(q).pipe(
            catchError(() => {
              this.isSearching = false;
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res: any) => {
        this.isSearching = false;
        if (res === null) return;
        this.searchResults = res?.content?.results ?? [];
        this.showSearchDropdown = true;
      });
  }

  get groupedResults(): { type: string; items: any[] }[] {
    const map = new Map<string, any[]>();
    for (const r of this.searchResults) {
      if (!map.has(r.type)) map.set(r.type, []);
      map.get(r.type)!.push(r);
    }
    return Array.from(map.entries()).map(([type, items]) => ({ type, items }));
  }

  onSearchInput(value: string): void {
    this.searchQuery = value;
    this.searchSubject.next(value);
  }

  navigateToResult(result: any): void {
    const buildRoute = this.routeMap[result.type];
    if (!buildRoute) return;
    this.closeSearch();
    this.router.navigate([buildRoute(result.id)]);
  }

  closeSearch(): void {
    this.showSearchDropdown = false;
    this.searchQuery = '';
    this.searchResults = [];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.showSearchDropdown = false;
    }
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }

  onOptionSelected(option: string) {
    this.selected = option;
  }

  handleOpenPopup() {
    this.sharedService.toggleSidebar();
  }

  canAccess(module: string): boolean {
    return this.permissionService.canAccessModule(module);
  }

  goToDashboard(): void {
    this.router.navigate(['dashboard/home']);
  }
}
