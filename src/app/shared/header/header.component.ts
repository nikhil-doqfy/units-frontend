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
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentRole: UserRole = 'owner';
  pageTitle: string = '';
  openSidebarValue = true;
  active = 1;
  isProfileActive = false;
  isAddPropertyActive = false;
  isAddLeaseActive = false;

  @Input() breadcrumbData: { label: string; link?: string }[] = [];

  private subscriptions = new Subscription();

  @ViewChild('searchContainer') searchContainer!: ElementRef;

  private modalService = inject(NgbModal);
  closeResult = '';

  constructor(
    private authService: AuthService,
    private renderer: Renderer2,
    private sharedService: SharedService,
    private router: Router,
    private themeService: ThemeService,
    private storage: StorageService
  ) {}

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

  // ✅ MOVE IT HERE (outside ngOnInit)
  private getRouteTitle(route: any): string {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.snapshot.data['title'] || '';
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

  // openLogoutModal(logoutContent: TemplateRef<any>) {
  //   const modalRef = this.modalService.open(logoutContent, {
  //     windowClass: 'logoutMdl',
  //     centered: true,
  //   });

  //   modalRef.result.then(
  //     (result) => {
  //       this.closeResult = `Closed with: ${result}`;
  //       this.logout();
  //     },
  //     (reason) => {
  //       this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //     }
  //   );
  // }

  // logout(): void {
  //   this.modalService.dismissAll();
  //   this.router.navigate(['/auth/login']);
  // }

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

  openLogoutModal(logoutContent: TemplateRef<any>) {
    const modalRef = this.modalService.open(logoutContent, {
      windowClass: 'logoutMdl',
      centered: true,
    });

    modalRef.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
        this.logout(); // ✅ Call logout function on modal close
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }
  getDismissReason(reason: any) {
    throw new Error('Method not implemented.');
  }

  logout() {
    const token = this.storage.getToken();
    this.authService.logout().subscribe({
      next: (resp: any) => {
        this.modalService.dismissAll(); // ✅ Close modal before logout
        this.router.navigate(['/auth/login']);
        // this.alertService.success(resp.message);
      },
      error: (error: any) => {
        this.modalService.dismissAll();
        this.router.navigate(['/auth/login']);
        localStorage.clear();
      },
    });
  }
}
