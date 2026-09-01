import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subject } from 'rxjs';

import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { TableViewCardComponent } from '../../component/table-view-card/table-view-card.component';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { TablePaginationComponent } from '../../component/table-pagination/table-pagination.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';

import { OwnerService } from '../../services/owner.service';
import { SharedService } from '../../../shared.service';
import { TenantDetailComponent } from '../tenant-detail/tenant-detail.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-owner-detail',
  standalone: true,
  imports: [
    CommonModule,
    WhiteCardComponent,
    TableViewCardComponent,
    TableTitleComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    ExportIconComponent,
    NoDataComponent,
    TableImgItemComponent,
    SortingIconComponent,
    TablePaginationComponent,
    TableSelectComponent,
    TableActionButtonComponent,
    TenantDetailComponent,
    TranslateModule,
  ],
  templateUrl: './owner-detail.component.html',
  styleUrl: './owner-detail.component.css',
})
export class OwnerDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ownerService = inject(OwnerService);
  private sharedService = inject(SharedService);
  private destroyRef = inject(DestroyRef);

  loading = signal(true);
  propsLoading = signal(false);
  owner: any = null;
  properties: any[] = [];

  totalRecords = 0;
  rowsPerPage = 10;
  currentPage = 1;
  totalPages = 1;
  rowsPerPageOptions = [10, 25, 50];
  componentName = 'OwnerDetailComponent';

  // ── Tenant detail view ───────────────────────────
  showTenantDetail = false;
  selectedTenantLease: any = null;

  private searchSubject$ = new Subject<string>();
  private searchText = '';
  private ownerId!: number;
  private alertService = inject(AlertService);

  constructor(private translate: TranslateService) {}
  ngOnInit(): void {
    this.ownerId = +(this.route.snapshot.paramMap.get('owner_id') || 0);
    if (!this.ownerId) {
      this.router.navigate(['/dashboard/owners']);
      return;
    }

    this.sharedService.setTitle('PAGE_TITLE.OWNERS');
    this.loadOwner();
    this.loadProperties();
    this.initSearchListener();
  }

  private initSearchListener() {
    this.searchSubject$
      .pipe(debounceTime(400), takeUntilDestroyed(this.destroyRef))
      .subscribe((text) => {
        this.searchText = text.trim();
        this.currentPage = 1;
        this.loadProperties();
      });
  }
  getLabel(key: string): string {
    return this.translate.instant(key);
  }
  loadOwner() {
    this.loading.set(true);
    this.ownerService
      .getOwners({ owner_id: this.ownerId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          const c = resp?.content;
          this.owner = c?.owner_details ?? c ?? null;
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  loadProperties() {
    this.propsLoading.set(true);
    const params: Record<string, any> = {
      owner_id: this.ownerId,
      page: this.currentPage,
      page_size: this.rowsPerPage,
    };
    if (this.searchText) params['search'] = this.searchText;

    this.ownerService
      .getOwnerDetails(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          // owner_id response: { content: { owner_details: {}, table: [] } }
          const c = resp?.content;
          this.properties = c?.table ?? (Array.isArray(c) ? c : []);
          this.totalRecords =
            resp?.pagination?.total_records ?? this.properties.length;
          this.totalPages = resp?.pagination?.total_pages ?? 1;
          this.propsLoading.set(false);
        },
        error: () => this.propsLoading.set(false),
      });
  }

  onRefresh() {
    this.loadProperties();
  }

  searchTextChange(text: string) {
    this.searchSubject$.next(text);
  }

  onPageChange(event: PageChange) {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.loadProperties();
  }

  onPageSizeChange(event: PageSizeChange) {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.loadProperties();
  }

  goBack() {
    this.router.navigate(['/dashboard/owners']);
  }

  handleExportClick() {
    const params = {
      owner_id: this.ownerId,
    };

    this.ownerService
      .export(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = `OwnerProperties.csv`;
        a.click();

        window.URL.revokeObjectURL(url);

        this.alertService.success('Exported successfully');
      });
  }
  viewProperty(prop: any) {
    const id = prop.property_id || prop.id;
    if (id) this.router.navigate(['/dashboard/properties', id]);
  }

  viewTenant(prop: any) {
    const tenantId = prop.tenant_id;
    if (!tenantId) return;
    this.selectedTenantLease = { tenant: { id: tenantId } };
    this.showTenantDetail = true;
  }

  onTenantDetailBack() {
    this.showTenantDetail = false;
    this.selectedTenantLease = null;
  }

  viewContract(prop: any) {
    const url = prop.pdf_url;
    if (url) {
      window.open(url, '_blank');
    }
  }

  editUnit(prop: any) {
    this.router.navigate(['/dashboard/new-units', prop.property_unit_id]);
  }

  downloadContract(prop: any) {
    const url = prop.pdf_download_url;
    if (!url) {
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agreement.pdf';
    a.target = '_blank';
    a.click();
  }

  get initial(): string {
    return (this.owner?.name || this.owner?.first_name || '?')
      .charAt(0)
      .toUpperCase();
  }

  statusClass(status: string): string {
    return status?.toLowerCase() === 'occupied'
      ? 'badge-occupied'
      : 'badge-vacant';
  }
}
