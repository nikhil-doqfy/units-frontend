import { Component, DestroyRef, inject, TemplateRef } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';

import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { SearchIconComponent } from '../../../shared/component/icons/search-icon/search-icon.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TablePaginationComponent } from '../../component/table-pagination/table-pagination.component';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../shared/model/shared.model';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { SharedService } from '../../../shared.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { ChequeBounceHistoryModalComponent } from '../../forms/cheque-bounce-history-modal/cheque-bounce-history-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { LeaseService } from '../../services/lease.service';
import { TenantDetailComponent } from '../tenant-detail/tenant-detail.component';
import { PropertyService } from '../../services/property.service';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-cheques',
  standalone: true,
  imports: [
    TranslateModule,
    CommonModule,
    WhiteCardComponent,
    CustomSelectComponent,
    SearchIconComponent,
    TableSelectComponent,
    TablePaginationComponent,
    SortingIconComponent,
    TableImgItemComponent,
    TableActionButtonComponent,
    ChequeBounceHistoryModalComponent,
    TenantDetailComponent,
    NoDataComponent,
    TableTitleComponent,
    TableSearchComponent,
  ],
  templateUrl: './cheques.component.html',
  styleUrl: './cheques.component.css',
})
export class ChequesComponent {
  private destroyRef = inject(DestroyRef);
  private translate = inject(TranslateService);
  private sharedService = inject(SharedService);
  private modalService = inject(NgbModal);
  private leaseService = inject(LeaseService);
  private router = inject(Router);
  private propertyService = inject(PropertyService);
  private alertService = inject(AlertService);

  // ── Status options (inline row dropdown) ─────────────────────────
  statusOptions: { key: string; value: string }[] = [
    { key: 'BALANCE', value: 'Balance' },
    { key: 'CREDITED', value: 'Credited' },
    { key: 'REALIZED', value: 'Realized' },
    { key: 'BOUNCED', value: 'Bounce' },
  ];

  getStatusOption(status: string): { key: string; value: string } | null {
    return this.statusOptions.find((o) => o.key === status) ?? null;
  }

  onChequeStatusChange(row: any, option: any) {
    if (!option?.key || !row?.cheque?.id) return;
    this.alertService.confirmStatusChange(option.value, () => {
      row.cheque.status = option.key;
      this.leaseService
        .updateLeaseCheque({ cheque_id: row.cheque.id, status: option.key })
        .subscribe({ next: () => this.loadSummary() });
    });
  }

  // ── Filter options ───────────────────────────────────────────────
  yearOptions: { key: string; value: string }[] = [];
  propertyOptions: { key: string; value: string }[] = [];
  blockOptions: { key: string; value: string }[] = [];
  unitOptions: { key: string; value: string }[] = [];

  filterYear = '';
  filterPropertyId = '';
  filterBlockId = '';
  filterUnitId = '';

  // ── Table state ──────────────────────────────────────────────────
  componentName = 'ChequesComponent';
  totalRecords = 0;
  rowsPerPageOptions = [10, 25, 50, 100];
  rowsPerPage = 10;
  currentPage = 1;
  tableData: any[] = [];
  loading = false;
  activeSummary: 'total' | 'credited' | 'realized' | 'bounce' | 'balance' =
    'total';
  breadcrumbData: BreadCrumb[] = [];

  private searchSubject$ = new Subject<string>();
  private searchText = '';

  // ── Tenant detail view ───────────────────────────────────────────
  showTenantDetail = false;
  selectedTenantLease: any = null;

  // ── Summary cards ────────────────────────────────────────────────
  summaryCards: {
    key: string;
    title: string;
    subtitle: string;
    amount: string;
    count: string;
    color: string;
  }[] = [
    {
      key: 'total',
      title: 'Total Cheques Received',
      subtitle: 'All cheques recorded',
      amount: '—',
      count: '—',
      color: 'grey',
    },
    {
      key: 'credited',
      title: 'Total Cheques Credited',
      subtitle: 'Based on post-dated cheques',
      amount: '—',
      count: '—',
      color: 'purple',
    },
    {
      key: 'realized',
      title: 'Cheques Realized',
      subtitle: 'Successfully credited',
      amount: '—',
      count: '—',
      color: 'green',
    },
    {
      key: 'bounce',
      title: 'Cheque Bounce',
      subtitle: 'Requires follow-up',
      amount: '—',
      count: '—',
      color: 'orange',
    },
    {
      key: 'balance',
      title: 'Balance Cheques',
      subtitle: 'Not yet deposited',
      amount: '—',
      count: '—',
      color: 'blue',
    },
  ];

  ngOnInit() {
    this.loadBreadcrumb();
    this.loadSummary();
    this.loadFilterOptions();
    this.loadCheques();
    this.searchSubject$
      .pipe(debounceTime(400), takeUntilDestroyed(this.destroyRef))
      .subscribe((text) => {
        this.searchText = text.trim();
        this.currentPage = 1;
        this.loadCheques();
      });
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadBreadcrumb());
  }

  loadSummary() {
    this.leaseService
      .getChequeSummary(this.filterParams())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          const s = resp?.content;
          if (!s) return;
          const fmt = (n: number) =>
            `AED ${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
          this.summaryCards = this.summaryCards.map((card) => ({
            ...card,
            amount: fmt(s[card.key]?.amount ?? 0),
            count: String(s[card.key]?.count ?? 0),
          }));
        },
      });
  }

  loadFilterOptions() {
    const currentYear = new Date().getFullYear();
    this.yearOptions = Array.from({ length: 6 }, (_, i) => {
      const y = String(currentYear - i);
      return { key: y, value: y };
    });

    this.propertyService
      .getProperties({ page: 1, page_size: 200 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.propertyOptions = (resp?.content || []).map((p: any) => ({
            key: String(p.id),
            value: p.property_name,
          }));
        },
      });
  }

  onPropertySelected(option: any) {
    this.filterPropertyId = option?.key ?? '';
    this.filterBlockId = '';
    this.filterUnitId = '';
    this.blockOptions = [];
    this.unitOptions = [];
    this.reloadAll();

    if (this.filterPropertyId) {
      this.propertyService
        .getPropertyBlocks({ property_id: this.filterPropertyId })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resp: any) => {
            this.blockOptions = (resp?.content || []).map((b: any) => ({
              key: String(b.id),
              value: b.block_name,
            }));
          },
        });
    }
  }

  onBlockSelected(option: any) {
    this.filterBlockId = option?.key ?? '';
    this.filterUnitId = '';
    this.unitOptions = [];
    this.reloadAll();

    if (this.filterBlockId) {
      this.propertyService
        .getUnits({
          property_block_tower_id: this.filterBlockId,
          page: 1,
          page_size: 200,
        })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resp: any) => {
            this.unitOptions = (resp?.content || []).map((u: any) => ({
              key: String(u.id),
              value: u.unit_name || u.code,
            }));
          },
        });
    }
  }

  onUnitSelected(option: any) {
    this.filterUnitId = option?.key ?? '';
    this.reloadAll();
  }

  onYearSelected(option: any) {
    this.filterYear = option?.key ?? '';
    this.reloadAll();
  }

  get hasActiveFilter(): boolean {
    return !!(
      this.filterYear ||
      this.filterPropertyId ||
      this.filterBlockId ||
      this.filterUnitId
    );
  }

  clearFilters() {
    this.filterYear = '';
    this.filterPropertyId = '';
    this.filterBlockId = '';
    this.filterUnitId = '';
    this.blockOptions = [];
    this.unitOptions = [];
    this.reloadAll();
  }

  private filterParams(): Record<string, any> {
    const p: Record<string, any> = {};
    if (this.filterYear) p['year'] = this.filterYear;
    if (this.filterPropertyId) p['property_id'] = this.filterPropertyId;
    if (this.filterBlockId) p['block_id'] = this.filterBlockId;
    if (this.filterUnitId) p['unit_id'] = this.filterUnitId;
    return p;
  }

  private reloadAll() {
    this.currentPage = 1;
    this.loadSummary();
    this.loadCheques();
  }

  loadCheques() {
    this.loading = true;
    const params: Record<string, any> = {
      ...this.filterParams(),
      page: this.currentPage,
      page_size: this.rowsPerPage,
    };
    if (this.searchText) params['search'] = this.searchText;
    if (this.activeSummary !== 'total') {
      params['status'] =
        this.activeSummary === 'bounce'
          ? 'BOUNCED'
          : this.activeSummary.toUpperCase();
    }

    this.leaseService
      .getAllCheques(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.tableData = resp?.content ?? [];
          this.totalRecords =
            resp?.pagination?.total_records ?? this.tableData.length;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  searchTextChange(text: string) {
    this.searchSubject$.next(text);
  }

  loadBreadcrumb() {
    this.setBreadCrumb([
      { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
      { label: 'PAGE_TITLE.CHEQUES', link: '' },
    ]);
  }

  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }

  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.loadCheques();
  }

  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.loadCheques();
  }

  onSummaryClick(key: any) {
    this.activeSummary = key;
    this.currentPage = 1;
    this.loadCheques();
  }

  // ── Property / Tenant detail ─────────────────────────────────────
  viewProperty(row: any) {
    const id = row?.property?.id;
    if (id) this.router.navigate(['/dashboard/properties', id]);
  }

  viewTenant(row: any) {
    const tenantId = row?.tenant?.id;
    if (!tenantId) return;
    this.selectedTenantLease = { tenant: { id: tenantId } };
    this.showTenantDetail = true;
  }

  onTenantDetailBack() {
    this.showTenantDetail = false;
    this.selectedTenantLease = null;
  }

  openChequeBounceHistoryModel(activityHistoryContent: TemplateRef<any>) {
    this.modalService.open(activityHistoryContent, {
      ariaLabelledBy: 'modal-title',
      windowClass: 'mdlCommon',
      centered: true,
    });
  }
}
