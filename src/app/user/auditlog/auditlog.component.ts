import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { WhiteCardComponent } from '../../shared/component/white-card/white-card.component';
import { DownloadIconComponent } from '../component/icons/download-icon/download-icon.component';
import { SearchIconComponent } from '../../shared/component/icons/search-icon/search-icon.component';
import { CircularCrossBtnIconComponent } from '../../icons/circular-cross-btn-icon/circular-cross-btn-icon.component';
import { Calender1IconComponent } from '../../icons/calender1-icon/calender1-icon.component';
import { UsersIconsComponent } from '../../icons/users-icons/users-icons.component';
import { CustomSelectComponent } from '../../dashboard/component/custom-select/custom-select.component';
import { DashTitleComponent } from '../../shared/component/dash-title/dash-title.component';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BreadCrumb } from '../../shared/model/shared.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SharedService } from '../../shared.service';

@Component({
  selector: 'app-auditlog',
  standalone: true,
  imports: [
    CommonModule,
    WhiteCardComponent,
    DownloadIconComponent,
    SearchIconComponent,
    CircularCrossBtnIconComponent,
    Calender1IconComponent,
    UsersIconsComponent,
    CustomSelectComponent,
    DashTitleComponent,
  ],
  templateUrl: './auditlog.component.html',
  styleUrl: './auditlog.component.css',
})
export class AuditlogComponent {
  pageTitle: string = '';
  currentLanguage = 'en';
  logs = [
    {
      name: 'Amin Usain',
      date: 'Feb 05, 2026',
      avatar: 'assets/user/user-6.svg',
      activities: [
        {
          title: 'Added new tenant for Palm Tower – Unit 1204',
          subtitle: 'pmc_admin created on Feb 05, 2026',
        },
        {
          title: 'Updated lease agreement for Marina Heights – Unit B302',
          subtitle: 'leasing_team updated on Feb 05, 2026',
        },
      ],
    },
    {
      name: 'Mohammed',
      date: 'Feb 03, 2026',
      avatar: 'assets/user/user-7.svg',
      activities: [
        {
          title: 'Recorded cheque payment for Downtown Residency – Unit 504',
          subtitle: 'finance_user logged on Feb 03, 2026',
        },
        {
          title:
            'Ejari registration submitted for Green Park Residence – Unit A110',
          subtitle: 'pmc_admin submitted on Feb 03, 2026',
        },
        {
          title: 'Ejari registration submitted for Sunset Villas – Unit C305',
          subtitle: 'pmc_admin submitted on Feb 15, 2026',
        },
        {
          title:
            'Ejari registration submitted for Ocean View Apartments – Unit D401',
          subtitle: 'pmc_admin submitted on Feb 20, 2026',
        },
        {
          title: 'Ejari registration submitted for Blue Sky Towers – Unit B204',
          subtitle: 'pmc_admin submitted on Feb 10, 2026',
        },
      ],
    },
  ];
  constructor(
    private router: Router,
    private translate: TranslateService,
  ) {
    this.pageTitle = this.getRouteTitle(this.router.routerState.root);
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

  private destroyRef = inject(DestroyRef);
  ngOnInit() {
    this.loadBreadcrumb();
  }
  showDetailView: boolean = false;

  private sharedService = inject(SharedService);
  breadcrumbData: BreadCrumb[] = [];

  initLanguageListener() {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadBreadcrumb();
      });
  }
  loadBreadcrumb() {
    if (this.showDetailView) {
      this.setBreadCrumb([
        { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
        {
          label: 'PAGE_TITLE.PROPERTIES',
          link: '/dashboard/Charges',
        },
        { label: 'PROPERTY_DETAILS', link: '' },
      ]);
    } else {
      this.setBreadCrumb([
        { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
        { label: 'PAGE_TITLE.AUDIT_LOG', link: '/dashboard/auditlog' },
      ]);
    }
  }
  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }
}
