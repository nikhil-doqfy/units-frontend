import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';

import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { TablePaginationComponent } from '../../component/table-pagination/table-pagination.component';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { TenantDetailComponent } from '../tenant-detail/tenant-detail.component';

import { TenantsService } from '../../services/tenants.service';
import { AlertService } from '../../../shared/services/alert.service';
import { SharedService } from '../../../shared.service';
import { BreadCrumb, PageChange, PageSizeChange } from '../../../shared/model/shared.model';

type MainTab = 'onboarding' | 'active';
type SubTab  = 'current' | 'past' | 'rejected';

const TAB_MAP: Record<MainTab | SubTab, string> = {
  onboarding: 'onboarding',
  active:     'active',
  current:    'active',
  past:       'past',
  rejected:   'rejected',
};

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [
    CommonModule,
    TableTitleComponent,
    TableSelectComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    ExportIconComponent,
    TableActionButtonComponent,
    TablePaginationComponent,
    SortingIconComponent,
    NoDataComponent,
    TableImgItemComponent,
    TenantDetailComponent,
    TranslateModule,
  ],
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.css',
})
export class TenantsComponent {
  private tenantsService = inject(TenantsService);
  private alertService   = inject(AlertService);
  private sharedService  = inject(SharedService);
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private destroyRef     = inject(DestroyRef);

  breadcrumbData: BreadCrumb[] = [];

  // ── Top-level tabs ───────────────────────────────
  mainTab: MainTab = 'onboarding';

  // ── Sub-tabs (shown only under Active) ──────────
  subTab: SubTab = 'current';

  subTabs: { key: SubTab; label: string }[] = [
    { key: 'current',  label: 'Current Tenants'  },
    { key: 'past',     label: 'Past Tenants'      },
    { key: 'rejected', label: 'Rejected Tenants'  },
  ];

  // ── Detail view ──────────────────────────────────
  showDetailView = false;
  selectedTenant: any = null;

  onTenantClick(tenant: any) {
    this.selectedTenant = tenant;
    this.showDetailView = true;
  }

  onDetailBack() {
    this.showDetailView = false;
    this.selectedTenant = null;
  }

  // ── Table state ──────────────────────────────────
  tenants: any[]     = [];
  totalRecords       = 0;
  rowsPerPage        = 10;
  currentPage        = 1;
  totalPages         = 1;
  rowsPerPageOptions = [10, 25, 50, 100];
  componentName      = 'TenantsComponent';

  private searchSubject$ = new Subject<string>();
  private searchText     = '';

  constructor() {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
    this.initSearchListener();
    this.loadTenants();
  }

  ngOnInit() {
    this.sharedService.getBreadcrumbs([
      { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
      { label: 'PAGE_TITLE.TENANTS',   link: ''               },
    ]).subscribe((data) => (this.breadcrumbData = data));
  }

  private initSearchListener() {
    this.searchSubject$
      .pipe(debounceTime(400), takeUntilDestroyed(this.destroyRef))
      .subscribe((text) => {
        this.searchText  = text.trim();
        this.currentPage = 1;
        this.loadTenants();
      });
  }

  // ── Tab switching ─────────────────────────────────
  selectMainTab(tab: MainTab) {
    this.mainTab     = tab;
    this.subTab      = 'current';
    this.currentPage = 1;
    this.searchText  = '';
    this.loadTenants();
  }

  selectSubTab(tab: SubTab) {
    this.subTab      = tab;
    this.currentPage = 1;
    this.searchText  = '';
    this.loadTenants();
  }

  private get backendTab(): string {
    return this.mainTab === 'onboarding' ? 'onboarding' : TAB_MAP[this.subTab];
  }

  get activeTableTitle(): string {
    if (this.mainTab === 'onboarding') return 'Onboarding Tenants';
    return this.subTabs.find((s) => s.key === this.subTab)?.label ?? 'Active Tenants';
  }

  // ── Data loading ──────────────────────────────────
  loadTenants() {
    const params: Record<string, any> = {
      tab:       this.backendTab,
      page:      this.currentPage,
      page_size: this.rowsPerPage,
    };
    if (this.searchText) params['search'] = this.searchText;

    this.tenantsService.getTenantsByTab(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.tenants      = resp?.content ?? [];
          this.totalRecords = resp?.pagination?.total_records ?? 0;
          this.totalPages   = resp?.pagination?.total_pages   ?? 1;
        },
      });
  }

  onRefresh() { this.loadTenants(); }

  searchTextChange(text: string) { this.searchSubject$.next(text); }

  onPageChange(event: PageChange) {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.loadTenants();
  }

  onPageSizeChange(event: PageSizeChange) {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.loadTenants();
  }

  handleExportClick() {
    const params: Record<string, any> = { tab: this.backendTab };
    if (this.searchText) params['search'] = this.searchText;

    this.tenantsService.exportTenantsByTab(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = `tenants_${this.backendTab}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.alertService.success('Exported successfully');
      });
  }

  goToProperty(propertyId: number | null) {
    if (propertyId) this.router.navigate(['/dashboard/properties', propertyId]);
  }

  continueOnboarding(tenant: any) {
    const leadData = {
      property_id:    tenant.property_id,
      property_name:  tenant.property_name,
      block_id:       tenant.property_block_id,
      block_name:     tenant.property_block_name,
      tenant_id:      tenant.tenant_id,
      email:          tenant.email,
      name:           tenant.tenant_name,
      contact_number: tenant.contact_number,
    };

    this.router.navigate(['/dashboard/new-tenant'], {
      state: {
        leaseId:     tenant.lease_id,
        leadData,
        leaseStatus: tenant.lease_status,
        leaseStage:  tenant.lease_stage,
      },
    });
  }

  statusBadgeClass(leaseStatus: string): string {
    switch (leaseStatus) {
      case 'ACTIVE':   return 'badge-active';
      case 'DRAFT':    return 'badge-draft';
      case 'INACTIVE': return 'badge-inactive';
      case 'EXPIRED':  return 'badge-expired';
      case 'REJECTED': return 'badge-rejected';
      default:         return 'badge-draft';
    }
  }
}
