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
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../shared/model/shared.model';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { FilterPopupButtonComponent } from '../../component/filter-popup-btn/filter-popup-btn.component';
import { SharedApiService } from '../../../shared/services/shared-api.service';
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
    CustomSelectComponent,
    FilterPopupButtonComponent,
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
  private sharedApiService = inject(SharedApiService);

  breadcrumbData: BreadCrumb[] = [];
  currentLanguage = 'en';
  currentRole: UserRole = 'owner';
  leaseStatus: any = [];
  selectedFilter: any;
  selectedleasestatus: any = null;
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
    this.initLeaseSearchListener();
  }

  ngOnInit() {
    this.loadBreadcrumb();
    this.initCurrentRoleListener();
    this.sharedService.initLanguage();
    this.initLanguageListener();
    this.getLease();
  }

  initCurrentRoleListener() {
    this.themeService.currentRole$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((role) => {
        this.currentRole = role;
      });
  }

  initLanguageListener() {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.sharedService.initLanguage();
        this.loadBreadcrumb();
      });
  }

  loadBreadcrumb() {
    this.setBreadCrumb([
      { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
      { label: 'PAGE_TITLE.LEASE', link: '' },
    ]);
  }

  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
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
          this.leaseList = resp?.content.results || [];
          this.totalRecords = resp?.pagination?.total_records ?? 0;
        },
      });
  }

  applyFilter() {
    this.leaseFilter['lease_status'] = this.selectedleasestatus.key;
    this.currentPage = 1;
    this.getLease();
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

  initLeaseSearchListener() {
    this.onLeaseSearch$
      .pipe(debounceTime(1000), takeUntilDestroyed(this.destroyRef))
      .subscribe((searchText) => {
        if (searchText?.trim()) this.leaseFilter['search'] = searchText.trim();
        else delete this.leaseFilter['search'];

        this.currentPage = 1;
        this.getLease();
      });
  }

  searchTextChange(search: string): void {
    this.onLeaseSearch$.next(search);
  }

  goToAddLease(): void {
    this.router.navigate(['/dashboard/add-lease']);
  }

  handleViewPdf(leaseId: number): void {
    this.leaseService
      .getLeasePdf(leaseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          const pdfUrl = resp?.content?.pdf_url;

          if (pdfUrl) {
            window.open(pdfUrl, '_blank');
          } else {
            this.alertService.error('PDF URL not found.');
          }
        },
        error: () => {
          this.alertService.error('Failed to open PDF preview.');
        },
      });
  }

  handleDownloadPdf(leaseId: number): void {
    this.leaseService
      .getLeasePdf(leaseId, 'download')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp: any) => {
        const pdfUrl = resp?.content?.pdf_url;
        if (pdfUrl) {
          const a = document.createElement('a');
          a.href = pdfUrl;
          a.download = `lease_${leaseId}.pdf`;
          a.click();
          this.alertService.success('PDF downloaded successfully!');
        } else {
          this.alertService.error('PDF URL not found.');
        }
      });
  }

  removeFilter() {
    this.selectedleasestatus = null;
    delete this.leaseFilter['lease_status'];
    this.currentPage = 1;
    this.getLease();
  }
  getOptionTypes(options: string[]) {
    this.sharedApiService
      .getOptions({ option_type: options.join(',') })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.leaseStatus = response?.content?.lease_status;
          console.log('data', this.leaseStatus);
        },
      });
  }
  onHandleLeaseStatusClick(): void {
    this.getOptionTypes(['LEASE_STATUS']);
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
