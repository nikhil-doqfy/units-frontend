import {
  Component,
  Renderer2,
  ElementRef,
  ViewChild,
  inject,
  TemplateRef,
  ViewEncapsulation,
  OnDestroy,
  OnInit,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { SharedService } from '../../shared.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ThemeService, UserRole } from '../../theme.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import {
  NgbDropdownModule,
  NgbNavModule,
  ModalDismissReasons,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';

import { DashTitleComponent } from '../component/dash-title/dash-title.component';
import { PlusIconComponent } from '../component/icons/plus-icon/plus-icon.component';
import { AppearanceIconComponent } from '../component/icons/appearance-icon/appearance-icon.component';
import { NotificationIconComponent } from '../component/icons/notification-icon/notification-icon.component';
import { ArrowDownIconComponent } from '../component/icons/arrow-down-icon/arrow-down-icon.component';
import { ArrowUpIconComponent } from '../component/icons/arrow-up-icon/arrow-up-icon.component';
import { ProfileIconComponent } from '../component/icons/profile-icon/profile-icon.component';
import { DocumentIconComponent } from '../component/icons/document-icon/document-icon.component';
import { LogoutIconComponent } from '../component/icons/logout-icon/logout-icon.component';
import { LogoutModalIconComponent } from '../component/icons/logout-modal-icon/logout-modal-icon.component';
import { DashBreadcrumbComponent } from '../component/dash-breadcrumb/dash-breadcrumb.component';
import { AuthService } from '../../auth/services/auth.service';
import { StorageService } from '../services/storage.service';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    NgbDropdownModule,
    NgbNavModule,
    DashTitleComponent,
    PlusIconComponent,
    AppearanceIconComponent,
    NotificationIconComponent,
    ArrowDownIconComponent,
    ArrowUpIconComponent,
    ProfileIconComponent,
    DocumentIconComponent,
    LogoutIconComponent,
    LogoutModalIconComponent,
    DashBreadcrumbComponent,
    TranslateModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentRole: UserRole = 'owner';
  currentLang = 'en';
  pageTitle: string = '';
  openSidebarValue = true;
  active = 1;
  isProfileActive = false;
  isAddPropertyActive = false;
  isAddLeaseActive = false;
  currentLanguage = 'en';
  userProfile = this.storage.getUserProfile();

  @Input() breadcrumbData: { label: string; link?: string }[] = [];

  private subscriptions = new Subscription();

  @ViewChild('searchContainer') searchContainer!: ElementRef;

  private modalService = inject(NgbModal);
  closeResult = '';

  constructor(
    private renderer: Renderer2,
    private sharedService: SharedService,
    private router: Router,
    private themeService: ThemeService,
    private authService: AuthService,
    private translate: TranslateService,
    private storage: StorageService,
    private alertService: AlertService
  ) {
    translate.addLangs(['en', 'ar']);
    translate.setDefaultLang('en');
    this.translate.onLangChange.subscribe((event: any) => {
      this.currentLanguage = event.lang;
      this.pageTitle = this.getRouteTitle(this.router.routerState.root);
    });
    translate.use('en');
    this.updateDirection();
  }

  setLanguage(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('language', lang);
    this.updateDirection();
  }

  private updateDirection() {
    document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
  }

  // Helper to get the flag path
  get flagIcon(): string {
    return this.currentLang === 'ar'
      ? 'assets/language/united-arab-emirates.png'
      : 'assets/language/united-kingdom.png';
  }

  private updateActiveButtons(url: string) {
    this.isAddPropertyActive = url.includes('/dashboard/add-property');
    this.isAddLeaseActive = url.includes('/dashboard/add-lease');
    this.isProfileActive = url.includes('/user/my-profile');
  }

  ngOnInit() {
    // ✅ Handle refresh case
    this.pageTitle = this.getRouteTitle(this.router.routerState.root);

    this.updateActiveButtons(this.router.url);

    this.subscriptions.add(
      this.sharedService.openSidebarValue$.subscribe((value) => {
        this.openSidebarValue = value;
      })
    );

    // ✅ Update title on route change
    this.subscriptions.add(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => {
          const currentRoute = this.router.routerState.root;
          this.pageTitle = this.getRouteTitle(currentRoute);
        })
    );

    // ✅ Highlight profile menu when needed
    this.subscriptions.add(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((event: any) => {
          const url = event.urlAfterRedirects;

          this.isAddPropertyActive = url.includes('/dashboard/add-property');
          this.isAddLeaseActive = url.includes('/dashboard/add-lease');
          this.isProfileActive = url.includes('/user/my-profile');

          // Update page title
          this.pageTitle = this.getRouteTitle(this.router.routerState.root);
        })
    );

    this.isProfileActive = this.router.url.includes('/user/my-profile');

    this.themeService.currentRole$.subscribe((role) => {
      this.currentRole = role;
    });
  }

  private getRouteTitle(route: any): string {
    while (route.firstChild) {
      route = route.firstChild;
    }

    const titleKey = route.snapshot.data['titleKey'];

    if (!titleKey) return '';

    return this.translate.instant(titleKey);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard/home']);
  }

  goToAddProperty(): void {
    this.router.navigate(['/dashboard/add-property']);
  }

  goToAddLease(): void {
    this.router.navigate(['/dashboard/add-lease']);
  }

  goToMyProfile(): void {
    this.router.navigate(['/user/my-profile']);
  }

  openLogoutModal(logoutContent: TemplateRef<any>) {
    const modalRef = this.modalService.open(logoutContent, {
      windowClass: 'logoutMdl',
      centered: true,
    });

    modalRef.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
        this.logout();
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  logout() {
    this.authService.logout().subscribe({
      next: (resp: any) => {
        this.modalService.dismissAll();
        this.router.navigate(['/auth/login']);
        console.log('monali');
        this.alertService.success(resp.message);
      },
      error: (error: any) => {
        this.modalService.dismissAll();
        this.router.navigate(['/auth/login']);
        localStorage.clear();
      },
    });
  }

  private getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.ESC:
        return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK:
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }
}
