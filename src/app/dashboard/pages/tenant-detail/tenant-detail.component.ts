import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  NgbDatepickerModule,
  NgbDateStruct,
  NgbDropdownModule,
  NgbModal,
  NgbPopoverModule,
} from '@ng-bootstrap/ng-bootstrap';
import { DateIconComponent } from '../../component/icons/date-icon/date-icon.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subject } from 'rxjs';
import { TenantsService } from '../../services/tenants.service';
import { LeaseService } from '../../services/lease.service';
import { AlertService } from '../../../shared/services/alert.service';
import { NoDataComponent } from '../../../no-data/no-data.component';

import { TableViewCardComponent } from '../../component/table-view-card/table-view-card.component';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { FilterPopupButtonComponent } from '../../component/filter-popup-btn/filter-popup-btn.component';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TablePaginationComponent } from '../../component/table-pagination/table-pagination.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { DocumentTypeItemComponent } from '../../component/document-type-item/document-type-item.component';
import { AreaGraphComponent } from '../../component/charts/area-graph/area-graph.component';
import { StatusActionDropdownComponent } from '../../../status-action-dropdown/status-action-dropdown.component';
import { BadgeComponent } from '../../component/badge/badge.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { RefreshIconComponent } from '../../component/icons/refresh-icon/refresh-icon.component';
import { DisableIconComponent } from '../../../icon/disable-icon/disable-icon.component';
import { InvoiceIconComponent } from '../../../icons/invoice-icon/invoice-icon.component';
import { BlockIconComponent } from '../../../icons/block-icon/block-icon.component';
import { TermsconditionIconComponent } from '../../../icons/termscondition-icon/termscondition-icon.component';
import { ReceiptIconComponent } from '../../../icons/receipt-icon/receipt-icon.component';
import { ArrowDownIconComponent } from '../../../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
import { ChnagePaymentModeFormComponent } from '../../component/forms/chnage-payment-mode-form/chnage-payment-mode-form.component';
import { ReplaceChequeComponent } from '../../component/forms/replace-cheque/replace-cheque.component';
import { ReceiptComponent } from '../../component/forms/receipt/receipt.component';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { CustomDropdownComponent } from '../../../component/custom-dropdown/custom-dropdown.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
@Component({
  selector: 'app-tenant-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    NgbPopoverModule,
    TableViewCardComponent,
    WhiteCardComponent,
    TableTitleComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    FilterPopupButtonComponent,
    CustomSelectComponent,
    TableSelectComponent,
    TablePaginationComponent,
    TableActionButtonComponent,
    DocumentTypeItemComponent,
    AreaGraphComponent,
    StatusActionDropdownComponent,
    BadgeComponent,
    ExportIconComponent,
    FilterIconComponent,
    RefreshIconComponent,
    DisableIconComponent,
    InvoiceIconComponent,
    BlockIconComponent,
    TermsconditionIconComponent,
    ReceiptIconComponent,
    ArrowDownIconComponent,
    ChnagePaymentModeFormComponent,
    ReplaceChequeComponent,
    ReceiptComponent,
    NoDataComponent,
    CustomDropdownComponent,
    NgbDropdownModule,
    NgbDatepickerModule,
    DateIconComponent,
    PdfViewerModule,
  ],
  templateUrl: './tenant-detail.component.html',
  styleUrl: './tenant-detail.component.css',
})
export class TenantDetailComponent implements OnChanges {
  @Input() selectedLease: any = null;
  @Output() back = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  private translate = inject(TranslateService);
  private modalService = inject(NgbModal);
  private tenantsService = inject(TenantsService);
  private leaseService = inject(LeaseService);
  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);
  tenantData: any = null;
  rentTransactions: any[] = [];
  additionalTransactions: any[] = [];
  searchQuery: string = '';
  private searchSubject$ = new Subject<string>();

  // Filter options
  paymentTypeOptions: { key: string; value: string }[] = [
    { key: 'CHEQUE', value: 'Cheque' },
    { key: 'CASH', value: 'Cash' },
    { key: 'BANK_TRANSFER', value: 'Bank Transfer' },
    { key: 'PDC', value: 'PDC' },
  ];

  statusOptions: { key: string; value: string }[] = [
    { key: 'BALANCE', value: 'Balance' },
    { key: 'CREDITED', value: 'Credited' },
    { key: 'REALIZED', value: 'Realized' },
    { key: 'BOUNCED', value: 'Bounce' },
  ];

  previewUrl: string = '';
  previewFileName: string = '';
  isPdfPreview: boolean = false;

  selectedPaymentType: { key: string; value: string } | null = null;
  selectedStatus: { key: string; value: string } | null = null;
  appliedPaymentType: { key: string; value: string } | null = null;
  appliedStatus: { key: string; value: string } | null = null;

  constructor() {
    this.searchSubject$
      .pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe((query: string) => {
        this.searchQuery = query;
        this.currentPage = 1;
        if (this.selectedLease?.id) {
          this.loadTransactions(this.selectedLease.id);
        }
      });
  }

  get allTransactions(): any[] {
    return [...this.rentTransactions, ...this.additionalTransactions];
  }
  areaChartData: {
    month: string;
    amount_received: number;
    cheque_bounce: number;
    total_amount: number;
  }[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedLease'] && this.selectedLease) {
      if (this.selectedLease?.tenant?.id) {
        this.loadTenantData(this.selectedLease.tenant.id);
      }
      if (this.selectedLease?.id) {
        this.loadTransactions(this.selectedLease.id);
        this.loadRentAnalytics(this.selectedLease.id);
        this.loadCheques();
        this.loadBanks();
      }
    }
  }

  private loadTenantData(tenantId: number): void {
    this.tenantsService
      .getTenantDetails({ tenant_id: tenantId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.tenantData = resp?.content ?? null;
        },
        error: () => {
          this.tenantData = null;
        },
      });
  }

  private loadTransactions(leaseId: number): void {
    const params: Record<string, any> = { lease_id: leaseId };
    if (this.searchQuery && this.searchQuery.trim()) {
      params['search'] = this.searchQuery.trim();
    }
    if (this.appliedPaymentType?.key) {
      params['payment_type'] = this.appliedPaymentType.key;
    }
    if (this.appliedStatus?.key) {
      params['status'] = this.appliedStatus.key;
    }
    this.leaseService
      .getLeaseCheques(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.rentTransactions = resp?.content?.all_cheques ?? [];
          this.totalRecords =
            resp?.pagination?.total_records ??
            resp?.content?.total_records ??
            this.rentTransactions.length;
          this.additionalTransactions = [];
        },
        error: () => {
          this.rentTransactions = [];
          this.additionalTransactions = [];
        },
      });
  }

  invoiceData: any = null;

  // ── view state ──────────────────────────────────────────────────
  showInvoiceDetails = false;
  showRenewalBlockedMsg = false;
  showMenu = false;
  showReceiptDropdown = false;
  showMonthDropdown = false;
  selectedReceiptType = '';

  // ── summary ─────────────────────────────────────────────────────
  totalAmount = '—';
  receivedAmount = '—';
  pendingAmount = '—';

  private loadRentAnalytics(leaseId: number): void {
    const fmt = (n: number) =>
      `AED ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    this.leaseService
      .getRentAnalytics({ lease_id: leaseId, year: new Date().getFullYear() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          const s = resp?.content?.summary;
          if (s) {
            this.totalAmount = fmt(s.total_amount ?? 0);
            this.receivedAmount = fmt(s.amount_received ?? 0);
            this.pendingAmount = fmt(s.pending_amount ?? 0);
          }
          this.areaChartData = resp?.content?.monthly ?? [];
        },
      });
  }

  componentName = 'TenantDetailComponent';
  totalRecords = 0;
  rowsPerPage = 10;
  rowsPerPageOptions = [10, 25, 50, 100];
  currentPage = 1;

  // ── helpers ─────────────────────────────────────────────────────
  getLabel(key: string): string {
    return this.translate.instant(key);
  }

  get leaseCharges(): any[] {
    return this.selectedLease?.lease_charges ?? [];
  }

  get leaseChargesTotalAmount(): number {
    return this.leaseCharges.reduce(
      (sum: number, lc: any) => sum + (lc.total ?? 0),
      0,
    );
  }

  get leaseChargesVatTotal(): number {
    return this.leaseCharges.reduce(
      (sum: number, lc: any) => sum + (lc.vat ?? 0),
      0,
    );
  }

  transactionStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('credit') || s.includes('paid') || s.includes('realiz'))
      return 'badge-active';
    if (s.includes('bounce') || s.includes('reject')) return 'badge-rejected';
    if (s.includes('invoice') || s.includes('generat')) return 'badge-draft';
    if (s.includes('pending') || s.includes('balance')) return 'badge-inactive';
    return 'badge-inactive';
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  showMsg() {
    this.showRenewalBlockedMsg = true;
  }
  hideMsg() {
    this.showRenewalBlockedMsg = false;
  }

  onRefresh() {
    if (this.selectedLease?.id) {
      this.loadTransactions(this.selectedLease.id);
      this.loadCheques();
    }
  }

  onSearchChange(searchValue: string) {
    this.searchSubject$.next(searchValue);
  }

  onPaymentTypeSelect(option: any) {
    this.selectedPaymentType = option;
  }

  onStatusSelect(option: any) {
    this.selectedStatus = option;
  }

  applyFilter() {
    this.appliedPaymentType = this.selectedPaymentType;
    this.appliedStatus = this.selectedStatus;
    this.currentPage = 1;
    if (this.selectedLease?.id) {
      this.loadTransactions(this.selectedLease.id);
    }
  }

  removeFilter() {
    this.selectedPaymentType = null;
    this.selectedStatus = null;
    this.appliedPaymentType = null;
    this.appliedStatus = null;
    this.currentPage = 1;
    if (this.selectedLease?.id) {
      this.loadTransactions(this.selectedLease.id);
    }
  }

  clearPaymentTypeFilter() {
    this.selectedPaymentType = null;
    this.appliedPaymentType = null;
    this.currentPage = 1;
    if (this.selectedLease?.id) {
      this.loadTransactions(this.selectedLease.id);
    }
  }

  clearStatusFilter() {
    this.selectedStatus = null;
    this.appliedStatus = null;
    this.currentPage = 1;
    if (this.selectedLease?.id) {
      this.loadTransactions(this.selectedLease.id);
    }
  }
  toggleReceipt() {
    this.showReceiptDropdown = !this.showReceiptDropdown;
    this.showMonthDropdown = false;
  }

  selectReceiptType(type: string) {
    this.selectedReceiptType = type;
    this.showMonthDropdown = true;
  }

  onViewInvoiceClick(lease: any, event: Event) {
    event.preventDefault();
    this.selectedLease = lease;
    this.invoiceData = null;
    this.showInvoiceDetails = true;
    if (lease?.id) {
      this.leaseService
        .getInvoice(lease.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resp: any) => {
            this.invoiceData = resp?.content ?? null;
          },
          error: () => {
            this.invoiceData = null;
          },
        });
    }
  }

  downloadFromUrl(url: string, _fileName: string): void {
    window.open(url, '_blank');
  }
  previewDocument(document: any, previewModal: any): void {
    const url =
      document.pdf_url ??
      document.file_url ??
      document.document_url ??
      document.path ??
      null;

    if (!url) {
      console.warn('No URL found for document preview:', document);
      return;
    }

    const fileName = document.file_name ?? document.title ?? 'Document';
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    this.isPdfPreview = ext === 'pdf';
    this.previewFileName = fileName;
    this.previewUrl = '';

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.blob();
      })
      .then((blob) => {
        if (this.previewUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(this.previewUrl);
        }
        this.previewUrl = URL.createObjectURL(blob);

        this.modalService.open(previewModal, {
          centered: true,
          size: 'xl',
          backdrop: 'static',
        });
      })
      .catch(() => {
        this.previewUrl = url;
        this.modalService.open(previewModal, {
          centered: true,
          size: 'xl',
          backdrop: 'static',
        });
      });
  }
  
  handleExportClick(leaseId: number) {
    const params = {
      lease_id: leaseId,
    };

    this.tenantsService
      .exportCheque(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = `RentTransactionCheques.csv`;
        a.click();

        window.URL.revokeObjectURL(url);

        this.alertService.success('Exported successfully');
      });
  }
  get invoiceAmountInWords(): string {
    const grand = this.invoiceData?.totals?.grand_total ?? 0;
    const dirhams = Math.floor(grand);
    const fils = Math.round((grand - dirhams) * 100);
    const dirhamWords = this.toWords(dirhams);
    const filsWords = this.toWords(fils);
    return `${dirhamWords} Dirhams And ${filsWords} Fils`;
  }

  private toWords(n: number): string {
    if (n === 0) return 'Zero';
    const ones = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ];
    const tens = [
      '',
      '',
      'Twenty',
      'Thirty',
      'Forty',
      'Fifty',
      'Sixty',
      'Seventy',
      'Eighty',
      'Ninety',
    ];
    const chunk = (num: number): string => {
      if (num === 0) return '';
      if (num < 20) return ones[num];
      if (num < 100)
        return (
          tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '')
        );
      return (
        ones[Math.floor(num / 100)] +
        ' Hundred' +
        (num % 100 ? ' ' + chunk(num % 100) : '')
      );
    };
    const parts: string[] = [];
    if (n >= 1_000_000) {
      parts.push(chunk(Math.floor(n / 1_000_000)) + ' Million');
      n %= 1_000_000;
    }
    if (n >= 1_000) {
      parts.push(chunk(Math.floor(n / 1_000)) + ' Thousand');
      n %= 1_000;
    }
    if (n > 0) {
      parts.push(chunk(n));
    }
    return parts.join(' ');
  }

  downloadInvoicePdf() {
    const leaseId = this.selectedLease?.id;
    if (!leaseId) return;

    this.leaseService
      .getInvoicePdf(leaseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          const url = resp?.content?.pdf_url;
          if (url) {
            const a = document.createElement('a');
            a.href = url;
            a.download = resp?.content?.file_name ?? 'invoice.pdf';
            a.target = '_blank';
            a.click();
          }
        },
      });
  }

  handleBackClick() {
    this.showInvoiceDetails = false;
    this.showRenewalBlockedMsg = false;
    this.back.emit();
  }

  handleCloseClick() {
    this.showInvoiceDetails = false;
    this.close.emit();
  }

  onPageChange(event: PageChange) {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
  }

  onPageSizeChange(event: PageSizeChange) {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
  }

  // ── Add Cheque ──────────────────────────────────────────────────
  rentCheques: any[] = [];
  additionalCheques: any[] = [];
  banks: { key: number; value: string; ifsc_code: string }[] = [];
  addingChequeType: 'RENT_CHEQUE' | 'ADDITIONAL_CHEQUE' = 'RENT_CHEQUE';
  savingCheque = false;
  chequeFile: File | null = null;

  // NgbDateStruct models for the three date pickers in the modal
  chequeDateStruct: NgbDateStruct | null = null;
  startDateStruct: NgbDateStruct | null = null;
  endDateStruct: NgbDateStruct | null = null;

  chequeForm: {
    payment_type: string;
    cheque_number: string;
    cheque_date: string;
    start_date: string;
    end_date: string;
    origin_bank_id: number | null;
    origin_account_number: string;
    origin_ifsc_code: string;
    settlement_bank_id: number | null;
    settlement_account_number: string;
    settlement_ifsc_code: string;
    amount: number | null;
  } = {
    payment_type: 'CHEQUE',
    cheque_number: '',
    cheque_date: '',
    start_date: '',
    end_date: '',
    origin_bank_id: null,
    origin_account_number: '',
    origin_ifsc_code: '',
    settlement_bank_id: null,
    settlement_account_number: '',
    settlement_ifsc_code: '',
    amount: null,
  };

  loadCheques(): void {
    const leaseId = this.selectedLease?.id;
    if (!leaseId) return;
    this.leaseService
      .getLeaseCheques({ lease_id: leaseId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          const c = resp?.content ?? {};
          this.rentCheques = c.rent_cheques ?? [];
          this.additionalCheques = c.additional_cheques ?? [];
        },
      });
  }

  loadBanks(): void {
    this.leaseService.getBanks().subscribe({
      next: (resp: any) => {
        this.banks = resp?.content?.bank ?? [];
      },
    });
  }

  openAddChequeModal(
    content: TemplateRef<any>,
    type: 'RENT_CHEQUE' | 'ADDITIONAL_CHEQUE' = 'RENT_CHEQUE',
  ) {
    this.addingChequeType = type;
    this.chequeDateStruct = null;
    this.startDateStruct = null;
    this.endDateStruct = null;
    this.chequeForm = {
      payment_type: 'CHEQUE',
      cheque_number: '',
      cheque_date: '',
      start_date: '',
      end_date: '',
      origin_bank_id: null,
      origin_account_number: '',
      origin_ifsc_code: '',
      settlement_bank_id: null,
      settlement_account_number: '',
      settlement_ifsc_code: '',
      amount: null,
    };
    this.chequeFile = null;
    if (!this.banks.length) {
      this.loadBanks();
    }
    this.modalService.open(content, {
      ariaLabelledBy: 'add-cheque-title',
      windowClass: 'mdlCommon',
      centered: true,
      size: 'lg',
    });
  }

  onOriginBankChange(): void {
    const bank = this.banks.find(
      (b) => b.key === this.chequeForm.origin_bank_id,
    );
    this.chequeForm.origin_ifsc_code = bank?.ifsc_code ?? '';
  }

  onSettlementBankChange(): void {
    const bank = this.banks.find(
      (b) => b.key === this.chequeForm.settlement_bank_id,
    );
    this.chequeForm.settlement_ifsc_code = bank?.ifsc_code ?? '';
  }

  onChequeFileSelected(event: Event): void {
    this.chequeFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  saveNewCheque(modal: any): void {
    const leaseId = this.selectedLease?.id;
    if (!leaseId) return;
    this.savingCheque = true;

    const payload: Record<string, any> = {
      lease_id: leaseId,
      cheque_type: this.addingChequeType,
      payment_type: this.chequeForm.payment_type,
      cheque_number: this.chequeForm.cheque_number,
      cheque_date: this.ngbDateToString(this.chequeDateStruct),
      start_date: this.ngbDateToString(this.startDateStruct),
      end_date: this.ngbDateToString(this.endDateStruct),
      origin_bank_id: this.chequeForm.origin_bank_id,
      origin_account_number: this.chequeForm.origin_account_number,
      settlement_bank_id: this.chequeForm.settlement_bank_id,
      settlement_account_number: this.chequeForm.settlement_account_number,
      amount: this.chequeForm.amount,
    };

    const doSave = (fileData?: { data: string; file_name: string }) => {
      if (fileData) {
        payload['file_data'] = fileData.data;
        payload['file_name'] = fileData.file_name;
      }
      this.leaseService
        .createLeaseCheque(payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.alertService.customSuccess('Cheque added successfully');
            this.savingCheque = false;
            modal.close();
            this.loadCheques();
            this.loadTransactions(leaseId);
          },
          error: () => {
            this.alertService.error('Failed to add cheque');
            this.savingCheque = false;
          },
        });
    };

    if (this.chequeFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        doSave({ data: base64, file_name: this.chequeFile!.name });
      };
      reader.readAsDataURL(this.chequeFile);
    } else {
      doSave();
    }
  }

  openChangePayementModeModal(content: TemplateRef<any>) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-title',
      windowClass: 'mdlCommon',
      centered: true,
    });
  }

  openreplaceChequeModal(content: TemplateRef<any>) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-title',
      windowClass: 'mdlCommon replaceChequeModel',
      centered: true,
      size: '900px' as any,
    });
  }

  openReceiptModal(content: TemplateRef<any>) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-title',
      windowClass: 'mdlCommon',
      centered: true,
      size: 'xl',
    });
  }

  // ── Date helpers (NgbDateStruct ↔ 'YYYY-MM-DD' string) ──────────
  ngbDateToString(d: NgbDateStruct | null): string {
    if (!d) return '';
    const mm = String(d.month).padStart(2, '0');
    const dd = String(d.day).padStart(2, '0');
    return `${d.year}-${mm}-${dd}`;
  }
}
