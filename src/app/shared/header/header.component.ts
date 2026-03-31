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
  WritableSignal,
  signal,
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
  NgbOffcanvas,
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
import { SignatureIconComponent } from '../../dashboard/component/icons/signature-icon/signature-icon.component';
import { EditIconComponent } from '../../dashboard/component/icons/edit-icon/edit-icon.component';
import { DeleteIconComponent } from '../../dashboard/component/icons/delete-icon/delete-icon.component';
import { UploadDocumentComponent } from '../../dashboard/component/upload-document/upload-document.component';
import { UploadFileModel } from '../model/shared.model';
import { UploadDocIconComponent } from '../../dashboard/component/icons/upload-doc-icon/upload-doc-icon.component';
import { TermsconditionIconComponent } from '../../icons/termscondition-icon/termscondition-icon.component';
import { ChargesIconComponent } from '../../icons/charges-icon/charges-icon.component';
import { AuditlogIconComponent } from '../../icons/auditlog-icon/auditlog-icon.component';
import { TransactionComponent } from '../transaction/transaction.component';
import { NewPropertryIconsComponent } from '../../icons/new-propertry-icons/new-propertry-icons.component';
import { NewUnitsComponent } from '../../dashboard/pages/new-units/new-units.component';
import { NewUnitsIconComponent } from '../../icons/new-units-icon/new-units-icon.component';
import { SearchContactIconComponent } from '../../icon/search-contact-icon/search-contact-icon.component';
import { SearchContactComponent } from '../search-contact/search-contact.component';
import { MoonIconComponent } from '../../icons/moon-icon/moon-icon.component';

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
    SignatureIconComponent,
    DeleteIconComponent,
    EditIconComponent,
    UploadDocIconComponent,
    TermsconditionIconComponent,
    ChargesIconComponent,
    AuditlogIconComponent,
    TransactionComponent,
    NewPropertryIconsComponent,
    NewUnitsComponent,
    NewUnitsIconComponent,
    SearchContactIconComponent,
    SearchContactComponent,
    MoonIconComponent,
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
  isOpen = false;
  userProfile = this.storage.getUserProfile();

  @Input() breadcrumbData: { label: string; link?: string }[] = [];

  private subscriptions = new Subscription();

  @ViewChild('searchContainer') searchContainer!: ElementRef;
  private offcanvasService = inject(NgbOffcanvas);
  private modalService = inject(NgbModal);
  currentbreadcrumb: { label: string; link?: string }[] = [];
  constructor(
    private renderer: Renderer2,
    private sharedService: SharedService,
    private router: Router,
    private themeService: ThemeService,
    private authService: AuthService,
    private translate: TranslateService,
    private storage: StorageService,
    private alertService: AlertService,
  ) {
    translate.addLangs(['en', 'ar']);
    translate.setDefaultLang('en');

    const savedLang = this.storage.getLanguage() || 'en';

    this.currentLang = savedLang;
    this.translate.use(savedLang);
    this.updateDirection();
    this.subscriptions.add(
      this.translate.onLangChange.subscribe((event: any) => {
        this.currentLanguage = event.lang;
        this.pageTitle = this.getRouteTitle(this.router.routerState.root);
      }),
    );

    translate.use(storage.getLanguage());
    this.updateDirection();
  }

  ngOnInit() {
    const theme = this.storage.getTheme();
    this.isDark = theme === 'dark';

    this.applyTheme();

    this.subscriptions.add(
      this.sharedService.breadcrumb$.subscribe((res) => {
        this.breadcrumbData = res;
      }),
    );

    this.pageTitle = this.getRouteTitle(this.router.routerState.root);

    this.updateActiveButtons(this.router.url);

    this.subscriptions.add(
      this.sharedService.openSidebarValue$.subscribe((value) => {
        this.openSidebarValue = value;
      }),
    );

    this.subscriptions.add(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => {
          const currentRoute = this.router.routerState.root;
          this.pageTitle = this.getRouteTitle(currentRoute);
        }),
    );

    this.subscriptions.add(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((event: any) => {
          const url = event.urlAfterRedirects;

          this.isAddPropertyActive = url.includes('/dashboard/add-property');
          this.isAddLeaseActive = url.includes('/dashboard/add-lease');
          this.isProfileActive = url.includes('/user/my-profile');

          this.pageTitle = this.getRouteTitle(this.router.routerState.root);
        }),
    );

    this.isProfileActive = this.router.url.includes('/user/my-profile');

    this.subscriptions.add(
      this.themeService.currentRole$.subscribe((role) => {
        this.currentRole = role;
      }),
    );
  }

  onUpload(event: UploadFileModel) {}
  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    console.log(file); // selected file
  }
  closeDropdown() {
    this.isOpen = false;
  }
  async setLanguage(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    this.storage.setLanguage(lang);
    this.updateDirection();

    await this.sharedService.getBreadcrumbs(
      this.sharedService.currentbreadcrumb,
    );
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('Selected file:', file);
    }
  }
  private updateDirection() {
    document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
  }

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

  get profileImageUrl(): string {
    const p = this.userProfile;
    if (!p?.profile_image) {
      return 'assets/userDefaultProImg.png';
    }

    return p.profile_image;
  }

  private getRouteTitle(route: any): string {
    let currentRoute = route;

    while (currentRoute?.firstChild) {
      currentRoute = currentRoute.firstChild;
    }

    const titleKey = currentRoute?.snapshot?.data?.['titleKey'];

    if (!titleKey) {
      return '';
    }

    return this.translate.instant(titleKey);
  }

  goToDocumentation() {
    this.router.navigate(['/dashboard/documentations']);
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

  // goToAddLease(): void {
  //   this.router.navigate(['/dashboard/add-lease']);
  // }

  goToNewTenant(): void {
    this.router.navigate(['/dashboard/new-tenant']);
  }

  goToMyProfile(): void {
    this.router.navigate(['/settings/profile']);
  }
  goToTermsConditions() {
    this.router.navigate(['/settings/terms']);
    console.log('function clicked');
  }

  openLogoutModal(logoutContent: TemplateRef<any>) {
    const modalRef = this.modalService.open(logoutContent, {
      windowClass: 'logoutMdl',
      centered: true,
    });

    modalRef.result.then(
      (result) => {
        this.closeResult.set(`Closed with: ${result}`);
        this.logout();
      },
      (reason) => {
        this.closeResult.set(`Dismissed ${this.getDismissReason(reason)}`);
      },
    );
  }

  logout() {
    this.subscriptions.add(
      this.authService.logout({}).subscribe({
        next: (resp: any) => {
          this.modalService.dismissAll();
          this.router.navigate(['/auth/login']);

          this.alertService.success(resp.message);
        },
        error: (error: any) => {
          this.modalService.dismissAll();
          this.router.navigate(['/auth/login']);
          localStorage.clear();
        },
      }),
    );
  }

  // private getDismissReason(reason: any): string {
  //   switch (reason) {
  //     case ModalDismissReasons.ESC:
  //       return 'by pressing ESC';
  //     case ModalDismissReasons.BACKDROP_CLICK:
  //       return 'by clicking on a backdrop';
  //     default:
  //       return `with: ${reason}`;
  //   }
  // }

  //----------------------------------notification----------------------------------------------------
  unreadCount: number = 0;
  deletedNotifications: any[] = [];
  readNotifications: any[] = [];
  unreadNotifications: any[] = [];
  readCount: number = 0;
  unDeletedNotifications: any[] = [];

  allCount: number = 0;

  notifications: any = [];

  getNotifications() {
    this.sharedService.getNotifications({}).subscribe((resp: any) => {
      this.notifications = resp.content.notifications_data;
      this.unDeletedNotifications = this.notifications.filter(
        (n: any) => !n.is_deleted,
      );
      this.readNotifications = this.notifications.filter(
        (n: any) => n.is_read && !n.is_deleted,
      );
      this.unreadNotifications = this.notifications.filter(
        (n: any) => !n.is_read && !n.is_deleted,
      );
      this.deletedNotifications = this.notifications.filter(
        (n: any) => n.is_deleted,
      );
      this.allCount = resp.content.notification_count;
      this.readCount = resp.content.read_notifications;
      this.unreadCount = resp.content.unread_notifications;
    });
  }

  openNotificaion(content: TemplateRef<any>) {
    this.offcanvasService.open(content, {
      position: 'end',
      scroll: false,
      panelClass: 'notificationOffcanvas',
    });
  }
  clearAllClearedNotifications() {
    this.sharedService
      .deleteNotification({ clear_all: true })
      .subscribe((resp: any) => {
        if (resp.status === 200) {
          this.alertService.success(resp.message);
          this.getNotifications();
        } else {
          this.alertService.error(resp.message);
        }
      });
  }
  markNotiFicationAsRead(id: number) {
    this.sharedService
      .readNotification({ notification_id: id })
      .subscribe((resp: any) => {
        if (resp.status === 200) {
          this.alertService.success(resp.message);
          this.getNotifications();
        }
      });
  }
  clearSingleNotifications(id: number) {
    this.sharedService
      .deleteNotification({ clear_notification_id: id })
      .subscribe((resp: any) => {
        if (resp.status === 200) {
          this.alertService.success(resp.message);
          this.getNotifications();
        } else {
          this.alertService.error(resp.message);
        }
      });
  }

  deleteNotification(id: number) {
    this.sharedService
      .deleteNotification({ notification_id: id })
      .subscribe((resp: any) => {
        if (resp.status === 200) {
          this.alertService.success(resp.message);
          this.getNotifications();
        }
      });
  }

  goToCharges() {
    this.router.navigate(['/settings/charges']);
  }
  goToAuditLog() {
    this.router.navigate(['/user/auditlog']);
  }
  isModalOpen = false;

  // New Property dropdown functions

  showDropdown = false;

  togglePropertyDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  openProperty() {
    this.showDropdown = false;
    this.goToAddProperty(); // tumcha existing method
  }

  openUnit() {
    this.showDropdown = false;
    this.goToAddUnit(); // new function
  }

  goToAddUnit() {
    this.router.navigate(['/dashboard/new-units']); // route tumchya project nusar change kara
  }
  isContactSearchOpen = false;

  openSearch() {
    this.isContactSearchOpen = true;
  }

  closeSearch() {
    this.isContactSearchOpen = false;
  }

  /*--------------------------notification model------------------------------------------------*/
  closeResult: WritableSignal<string> = signal('');

  openNotificationModal(addUserContent: TemplateRef<any>) {
    this.modalService
      .open(addUserContent, {
        ariaLabelledBy: 'modal-title',
        windowClass: 'mdlCommon right-side-modal',
        centered: true,
      })
      .result.then(
        (result) => {
          this.closeResult.set(`Closed with: ${result}`);
        },
        (reason) => {
          this.closeResult.set(`Dismissed ${this.getDismissReason(reason)}`);
        },
      );
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
  /*----------------------------Toggle mode--------------------------------*/
  isDark: boolean = false;
  toggleTheme() {
    this.isDark = !this.isDark;

    const theme = this.isDark ? 'dark' : 'light';

    this.storage.setTheme(theme); // 👈 save in localStorage

    this.applyTheme();
  }

  applyTheme() {
    const themeClass = this.isDark ? 'dark-theme' : 'light-theme';

    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(themeClass);
  }
}
