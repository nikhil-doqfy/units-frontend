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
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BreadCrumb } from '../../shared/model/shared.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SharedService } from '../../shared.service';
import { AuditlogService } from '../../auditlog.service';
import { UserService } from '../services/user.service';
import { NoDataComponent } from '../../no-data/no-data.component';
import { AlertService } from '../../shared/services/alert.service';

@Component({
  selector: 'app-auditlog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    WhiteCardComponent,
    DownloadIconComponent,
    SearchIconComponent,
    CircularCrossBtnIconComponent,
    Calender1IconComponent,
    UsersIconsComponent,
    CustomSelectComponent,
    DashTitleComponent,
    TranslateModule,
    NoDataComponent,
  ],
  templateUrl: './auditlog.component.html',
  styleUrl: './auditlog.component.css',
})
export class AuditlogComponent {
  auditLogList: any[] = [];
  pageTitle: string = '';
  currentLanguage = 'en';

  searchText = '';
  selectedUser: any = null;
  selectedTime: any = null;
  private alertService = inject(AlertService);
  userOptions: any[] = [{ key: '', value: 'All Users', id: '' }];
  timeOptions = [
    { key: '', value: 'All Time' },
    { key: 'today', value: 'Today' },
    { key: '7days', value: 'Last 7 Days' },
    { key: '30days', value: 'Last 30 Days' },
  ];
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
    private auditLogService: AuditlogService,
    private userService: UserService,
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
    this.getAuditLog();
    this.loadUserOptions();
    this.sharedService.initLanguage();
    this.initLanguageListener();
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
  get displayLogs() {
    const groups = new Map<string, any>();

    for (const entry of this.auditLogList) {
      const date = entry.created
        ? new Date(entry.created).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          })
        : '';
      const userName = entry.user?.name || 'Unknown';
      const key = `${userName}_${date}`;

      if (!groups.has(key)) {
        groups.set(key, {
          name: userName,
          date,
          avatar: entry.user?.profile_image || null,
          activities: [],
        });
      }
      groups.get(key).activities.push({
        title: entry.message || '',
        subtitle: `${entry.action_type || ''} on ${date}`,
      });
    }
    return Array.from(groups.values());
  }

  private buildFilterParams(): Record<string, any> {
    const params: Record<string, any> = {};
    if (this.selectedUser?.id) params['user_id'] = this.selectedUser.id;
    if (this.selectedTime?.key) params['time_range'] = this.selectedTime.key;
    if (this.searchText.trim()) params['search'] = this.searchText.trim();
    return params;
  }

  onFilterChange() {
    this.getAuditLog();
  }

  loadUserOptions() {
    this.userService
      .getStaffList({ page_number: 1, limit: 1000 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          const staff: any[] = resp?.content ?? [];
          this.userOptions = [
            { key: '', value: 'All Users', id: '' },
            ...staff.map((s: any) => ({
              key: s.staff_name,
              value: s.staff_name,
              id: s.staff_id,
            })),
          ];
        },
      });
  }

  // getAuditLog() {
  //   this.auditLogService
  //     .getAuditLog(this.buildFilterParams())
  //     .pipe(takeUntilDestroyed(this.destroyRef))
  //     .subscribe((resp: any) => {
  //       this.auditLogList = resp?.content ?? [];
  //     });
  // }

  getAuditLog() {
    this.auditLogService
      .getAuditLog(this.buildFilterParams())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.auditLogList = resp?.content ?? [];
        },

        error: (err: any) => {
          console.error('Audit log fetch failed', err);

          this.auditLogList = [];

          this.alertService.error(
            err?.error?.message || 'Failed to load audit logs',
          );
        },
      });
  }

  // downloadLogs() {
  //   this.auditLogService
  //     .exportAuditLog(this.buildFilterParams())
  //     .pipe(takeUntilDestroyed(this.destroyRef))
  //     .subscribe((blob: Blob) => {
  //       const url = URL.createObjectURL(blob);
  //       const link = document.createElement('a');
  //       link.href = url;
  //       link.download = 'audit_logs.csv';
  //       link.click();
  //       URL.revokeObjectURL(url);
  //     });
  // }
  downloadLogs() {
    this.auditLogService
      .exportAuditLog(this.buildFilterParams())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob: Blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'audit_logs.csv';
          link.click();
          URL.revokeObjectURL(url);

          this.alertService.success('File downloaded successfully');
        },

        error: (err: any) => {
          console.error('Download failed', err);

          this.alertService.error(
            err?.error?.message || 'Failed to download audit logs',
          );
        },
      });
  }
}
