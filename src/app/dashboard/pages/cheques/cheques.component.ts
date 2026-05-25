import { Component, DestroyRef, inject, TemplateRef } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
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

  // ── Edit cheque modal ─────────────────────────────────────────────
  editingRow: any = null;
  savingCheque = false;
  editFile: File | null = null;
  banks: { key: number; value: string; ifsc_code: string }[] = [];

  editDraft: {
    payment_type: string;
    cheque_number: string;
    amount: number | null;
    cheque_date: string;
    start_date: string;
    end_date: string;
    origin_bank_id: number | null;
    origin_account_number: string;
    origin_ifsc_code: string;
    settlement_bank_id: number | null;
    settlement_account_number: string;
    settlement_ifsc_code: string;
  } = {
    payment_type: 'CHEQUE',
    cheque_number: '',
    amount: null,
    cheque_date: '',
    start_date: '',
    end_date: '',
    origin_bank_id: null,
    origin_account_number: '',
    origin_ifsc_code: '',
    settlement_bank_id: null,
    settlement_account_number: '',
    settlement_ifsc_code: '',
  };

  get isEditFormValid(): boolean {
    return !!(
      this.editDraft.cheque_number?.trim() &&
      this.editDraft.cheque_date &&
      this.editDraft.amount !== null &&
      this.editDraft.amount > 0
    );
  }

  loadBanks() {
    if (this.banks.length) return;
    this.leaseService
      .getBanks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.banks = resp?.content?.bank ?? [];
        },
      });
  }

  openEditModal(row: any, content: TemplateRef<any>) {
    this.editingRow = row;
    this.editFile = null;
    this.savingCheque = false;
    this.editDraft = {
      payment_type: row.cheque.payment_type || 'CHEQUE',
      cheque_number: row.cheque.cheque_number || '',
      amount: row.cheque.amount ?? null,
      cheque_date: row.cheque.cheque_date
        ? String(row.cheque.cheque_date).substring(0, 10)
        : '',
      start_date: '',
      end_date: '',
      origin_bank_id: null,
      origin_account_number: '',
      origin_ifsc_code: '',
      settlement_bank_id: null,
      settlement_account_number: '',
      settlement_ifsc_code: '',
    };
    this.loadBanks();
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-title',
      windowClass: 'mdlCommon',
      centered: true,
      size: 'lg',
    });
    this.leaseService
      .getChequeById(row.cheque.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          const c = resp?.content;
          if (!c) return;
          this.editDraft = {
            payment_type: c.payment_type || 'CHEQUE',
            cheque_number: c.cheque_number || '',
            amount: c.amount ?? null,
            cheque_date: c.cheque_date
              ? String(c.cheque_date).substring(0, 10)
              : '',
            start_date: c.start_date
              ? String(c.start_date).substring(0, 10)
              : '',
            end_date: c.end_date ? String(c.end_date).substring(0, 10) : '',
            origin_bank_id: c.origin_bank?.id ?? null,
            origin_account_number: c.origin_account_number
              ? String(c.origin_account_number)
              : '',
            origin_ifsc_code: c.origin_bank?.ifsc_code || '',
            settlement_bank_id: c.selltlement_bank?.id ?? null,
            settlement_account_number: c.settlement_account_number
              ? String(c.settlement_account_number)
              : '',
            settlement_ifsc_code: c.selltlement_bank?.ifsc_code || '',
          };
        },
      });
  }

  onEditOriginBankChange() {
    const bank = this.banks.find(
      (b) => b.key === this.editDraft.origin_bank_id,
    );
    this.editDraft.origin_ifsc_code = bank?.ifsc_code ?? '';
  }

  onEditSettlementBankChange() {
    const bank = this.banks.find(
      (b) => b.key === this.editDraft.settlement_bank_id,
    );
    this.editDraft.settlement_ifsc_code = bank?.ifsc_code ?? '';
  }

  onEditFileSelected(event: Event) {
    this.editFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  saveEditModal(modal: any) {
    if (!this.editingRow || !this.isEditFormValid) return;
    this.savingCheque = true;

    const payload: Record<string, any> = {
      cheque_id: this.editingRow.cheque.id,
      payment_type: this.editDraft.payment_type,
      cheque_number: this.editDraft.cheque_number,
      amount: this.editDraft.amount,
      cheque_date: this.editDraft.cheque_date,
      start_date: this.editDraft.start_date,
      end_date: this.editDraft.end_date,
      origin_bank_id: this.editDraft.origin_bank_id,
      origin_account_number: this.editDraft.origin_account_number,
      selltlement_bank_id: this.editDraft.settlement_bank_id,
      settlement_account_number: this.editDraft.settlement_account_number,
    };

    const doSave = (fileData?: { data: string; file_name: string }) => {
      if (fileData) {
        payload['file_data'] = fileData.data;
        payload['file_name'] = fileData.file_name;
      }
      this.leaseService
        .updateLeaseCheque(payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.editingRow.cheque.cheque_number = this.editDraft.cheque_number;
            this.editingRow.cheque.cheque_date = this.editDraft.cheque_date;
            this.editingRow.cheque.amount = this.editDraft.amount;
            this.editingRow.cheque.payment_type = this.editDraft.payment_type;
            this.editingRow = null;
            this.savingCheque = false;
            modal.close();
            this.alertService.success('Cheque updated successfully');
          },
          error: () => {
            this.savingCheque = false;
            this.alertService.error('Failed to update cheque');
          },
        });
    };

    if (this.editFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        doSave({ data: base64, file_name: this.editFile!.name });
      };
      reader.readAsDataURL(this.editFile);
    } else {
      doSave();
    }
  }

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
      title: 'TOTAL_CHEQUES_RECEIVED',
      subtitle: 'ALL_CHEQUES_RECORDED',
      amount: '—',
      count: '—',
      color: 'grey',
    },
    {
      key: 'credited',
      title: 'TOTAL_CHEQUES_CREDITED',
      subtitle: 'BASED_ONPOST_DATED_CHEQUES',
      amount: '—',
      count: '—',
      color: 'purple',
    },
    {
      key: 'realized',
      title: 'CHEQUES_REALIZED',
      subtitle: 'SUCCESSFULLY_CREDITED',
      amount: '—',
      count: '—',
      color: 'green',
    },
    {
      key: 'bounce',
      title: 'CHEQUES_BOUNCED',
      subtitle: 'REQUIRES_FOLLOW_UP',
      amount: '—',
      count: '—',
      color: 'orange',
    },
    {
      key: 'balance',
      title: 'BALANCE_CHEQUES',
      subtitle: 'NOT_YET_DEPOSITED',
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
    this.sharedService.initLanguage();
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
  sortField: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';
  sort(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }

    this.tableData = this.sharedService.sortData(
      this.tableData,
      field,
      this.sortOrder,
    );
  }
}
