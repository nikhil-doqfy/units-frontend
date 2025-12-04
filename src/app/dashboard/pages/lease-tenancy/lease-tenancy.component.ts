import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeService, UserRole } from '../../../theme.service';

import { PlusIconComponent } from '../../../shared/component/icons/plus-icon/plus-icon.component';
import { TableTitleComponent } from '../../../dashboard/component/table-title/table-title.component';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { BadgeComponent } from '../../component/badge/badge.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../../dashboard/component/table-filter-btn/table-filter-btn.component';
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { TablePaginationComponent } from '../../../dashboard/component/table-pagination/table-pagination.component';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { DashTitleComponent } from '../../../shared/component/dash-title/dash-title.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { SharedService } from '../../../shared.service';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { LeaseService } from '../../services/lease.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-lease-tenancy',
  standalone: true,
  imports: [
    CommonModule,
    PlusIconComponent,
    TableTitleComponent,
    TableImgItemComponent,
    BadgeComponent,
    TableSelectComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    FilterIconComponent,
    ExportIconComponent,
    TableActionButtonComponent,
    TablePaginationComponent,
    SortingIconComponent,
    DashTitleComponent,
    TranslateModule,
    NoDataComponent,
  ],
  templateUrl: './lease-tenancy.component.html',
  styleUrl: './lease-tenancy.component.css',
})
export class LeaseTenancyComponent {
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  private alertService = inject(AlertService);
  private translate = inject(TranslateService);
  private leaseService = inject(LeaseService);
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Lease', link: '' },
  ];
  currentLanguage = 'en';
  currentRole: UserRole = 'owner';

  componentName = 'LeaseTenancyComponent';
  leaseList: any[] = [];
  leaseFilter: Record<string, any> = {};
  totalRecords: number = 0;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;

  private onLeaseSearch$ = new Subject<string>();
  constructor(
    private router: Router,
    private themeService: ThemeService,
    private destroyRef: DestroyRef
  ) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);

    this.onLeaseSearch$
      .pipe(debounceTime(1000), takeUntilDestroyed(this.destroyRef))
      .subscribe((searchText) => {
        if (searchText?.trim()) this.leaseFilter['search'] = searchText.trim();
        else delete this.leaseFilter['search'];

        this.currentPage = 1;
        this.getLease();
      });
  }

  ngOnInit() {
    this.loadBreadcrumb();
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadBreadcrumb());
    this.themeService.currentRole$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((role) => {
        this.currentRole = role;
      });

    this.getLease();
  }

  async loadBreadcrumb() {
    this.breadcrumbData = await this.sharedService.getBreadcrumbs([
      { key: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
      { key: 'PAGE_TITLE.LEASE', link: '' },
    ]);
    const lang = localStorage.getItem('language') || 'en';
    this.currentLanguage = lang;
    this.translate.use(lang);
    const direction = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = direction;
    this.themeService.currentRole$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((role) => {
        this.currentRole = role;
      });
  }

  getLease() {
    this.leaseFilter = {
      ...this.leaseFilter,
      limit: this.rowsPerPage,
      page: this.currentPage,
    };

    this.leaseService
      .getLeasePropertyDetails(this.leaseFilter)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.leaseList = resp?.content || [];
          this.totalRecords = resp?.pagination?.total_records ?? 0;
        },
      });
  }

  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.getLease();
  }

  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.getLease();
  }
  searchTextChange(search: string): void {
    this.onLeaseSearch$.next(search);
  }

  goToAddLease(): void {
    this.router.navigate(['/dashboard/add-lease']);
  }

  handleFilterClick(): void {
    console.log('Filter button clicked');
  }

  handleExportClick(): void {
    this.leaseService
      .getExcelFileOflease({})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          console.log('response:--->', resp);

          const url = window.URL.createObjectURL(resp);

          const a = document.createElement('a');
          a.href = url;
          a.download = 'lease_export.csv';
          a.click();

          window.URL.revokeObjectURL(url);

          this.alertService.success('File downloaded successfully!');
        },
        error: (err) => {
          this.alertService.error(
            err?.error?.message || 'Failed to download lease file'
          );
        },
      });
  }

  handleEditClick(leaseId: number) {
    this.router.navigate(['dashboard/edit-lease', leaseId]);
  }

  handleDownloadClick(): void {
    console.log('Download button clicked');
  }

  handlePreviewClick(): void {
    console.log('Preview button clicked');
  }
}
