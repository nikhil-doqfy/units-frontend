import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  NgbDropdownModule,
  NgbModal,
  NgbPopoverModule,
} from '@ng-bootstrap/ng-bootstrap';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subject } from 'rxjs';
import { TenantsService } from '../../services/tenants.service';
import { LeaseService } from '../../services/lease.service';
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
import { BadgeComponent } from '../../component/badge/badge.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { RefreshIconComponent } from '../../component/icons/refresh-icon/refresh-icon.component';
import { DisableIconComponent } from '../../../icon/disable-icon/disable-icon.component';
import { InvoiceIconComponent } from '../../../icons/invoice-icon/invoice-icon.component';
import { BlockIconComponent } from '../../../icons/block-icon/block-icon.component';
import { TermsconditionIconComponent } from '../../../icons/termscondition-icon/termscondition-icon.component';
import { ReceiptIconComponent } from '../../../icons/receipt-icon/receipt-icon.component';
import { DownloadIconComponent } from '../../../icons/download-icon/download-icon.component';
import { ArrowDownIconComponent } from '../../../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
import { ChnagePaymentModeFormComponent } from '../../component/forms/chnage-payment-mode-form/chnage-payment-mode-form.component';
import { ReplaceChequeComponent } from '../../component/forms/replace-cheque/replace-cheque.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { CustomDropdownComponent } from '../../../component/custom-dropdown/custom-dropdown.component';
import { AlertService } from '../../../shared/services/alert.service';

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
    BadgeComponent,
    ExportIconComponent,
    FilterIconComponent,
    RefreshIconComponent,
    DisableIconComponent,
    InvoiceIconComponent,
    BlockIconComponent,
    TermsconditionIconComponent,
    ReceiptIconComponent,
    DownloadIconComponent,
    ArrowDownIconComponent,
    ChnagePaymentModeFormComponent,
    ReplaceChequeComponent,
    PdfViewerModule,
    NoDataComponent,
    CustomDropdownComponent,
    NgbDropdownModule,
  ],
  templateUrl: './tenant-detail.component.html',
  styleUrl: './tenant-detail.component.css',
})
export class TenantDetailComponent implements OnInit, OnChanges {
  @Input() selectedLease: any = null;
  @Output() back = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  private translate = inject(TranslateService);
  private modalService = inject(NgbModal);
  private tenantsService = inject(TenantsService);
  private leaseService = inject(LeaseService);
  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  // true when this component is the routed page (/dashboard/tenant-detail/:id)
  // rather than embedded inline via [selectedLease] by a parent page.
  private isRoutedMode = false;
  tenantData: any = null;
  rentTransactions: any[] = [];
  additionalTransactions: any[] = [];
  searchQuery: string = '';
  private searchSubject$ = new Subject<string>();

  getStatusOption(status: string): { key: string; value: string } | null {
    return this.statusOptions.find((o) => o.key === status) ?? null;
  }

  onChequeStatusChange(t: any, option: any) {
    if (!option?.key || !t?.id) return;
    this.alertService.confirmStatusChange(option.value, () => {
      t.status = option.key;
      this.leaseService
        .updateLeaseCheque({ cheque_id: t.id, status: option.key })
        .subscribe({
          next: () => {
            if (this.selectedLease?.id) {
              this.loadTransactions(this.selectedLease.id);
            }
          },
        });
    });
  }

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

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get('id');
    if (routeId) {
      this.isRoutedMode = true;
      this.leaseService
        .getLeaseById(+routeId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resp: any) => {
            this.selectedLease = resp;
            this.loadLeaseDetail();
          },
          error: () => {
            this.alertService.error('Failed to load tenant details.');
          },
        });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedLease'] && this.selectedLease) {
      this.loadLeaseDetail();
    }
  }

  private loadLeaseDetail(): void {
    if (this.selectedLease?.tenant?.id) {
      this.loadTenantData(this.selectedLease.tenant.id);
    }
    if (this.selectedLease?.id) {
      this.loadTransactions(this.selectedLease.id);
      this.loadRentAnalytics(this.selectedLease.id);
      this.loadActivityHistory(this.selectedLease.id);
    }
  }

  activityHistory: any[] = [];

  private loadActivityHistory(leaseId: number): void {
    this.leaseService
      .getLeaseActivityHistory(leaseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.activityHistory = resp?.content ?? [];
        },
        error: () => {
          this.activityHistory = [];
        },
      });
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
    const params: Record<string, any> = {
      lease_id: leaseId,
      page: this.currentPage,
      page_size: this.rowsPerPage,
    };
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
  // Computed from the same lease-wide totalRentAmount/allTransactions the
  // header tile uses, rather than a separate year-filtered API call --
  // otherwise this card's "Total Rental Amount" and the header's "Total
  // Amount" show two different numbers for the same lease.
  private formatAed(n: number): string {
    return `AED ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  get totalAmount(): string {
    return this.formatAed(this.totalRentAmount);
  }

  private get receivedAmountValue(): number {
    return this.allTransactions
      .filter((t) => t.status === 'CREDITED' || t.status === 'REALIZED')
      .reduce((sum: number, t: any) => sum + (t.total ?? 0), 0);
  }

  get receivedAmount(): string {
    return this.formatAed(this.receivedAmountValue);
  }

  get pendingAmount(): string {
    return this.formatAed(this.totalRentAmount - this.receivedAmountValue);
  }

  private loadRentAnalytics(leaseId: number): void {
    this.leaseService
      .getRentAnalytics({ lease_id: leaseId, year: new Date().getFullYear() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
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

  // leaseChargesTotalAmount is already VAT-inclusive (lc.total = amount +
  // vat per charge) -- don't add leaseChargesVatTotal on top of it here,
  // that would double-count the VAT.
  get totalRentAmount(): number {
    const annualRent = this.selectedLease?.financials?.annual_amount ?? 0;
    return annualRent + this.leaseChargesTotalAmount;
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
    if (this.isRoutedMode) {
      this.location.back();
    } else {
      this.back.emit();
    }
  }

  handleCloseClick() {
    this.showInvoiceDetails = false;
    if (this.isRoutedMode) {
      this.location.back();
    } else {
      this.close.emit();
    }
  }

  onPageChange(event: PageChange) {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    if (this.selectedLease?.id) {
      this.loadTransactions(this.selectedLease.id);
    }
  }

  onPageSizeChange(event: PageSizeChange) {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    if (this.selectedLease?.id) {
      this.loadTransactions(this.selectedLease.id);
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

  previewTransaction: any = null;
  previewTab: 'receipt' | 'invoice' = 'receipt';
  previewReceiptUrl = '';
  previewInvoiceUrl = '';

  openReceiptModal(t: any, content: TemplateRef<any>) {
    this.previewTransaction = t;
    this.previewTab = t?.file_path ? 'receipt' : 'invoice';
    this.previewReceiptUrl = '';
    this.previewInvoiceUrl = '';
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-title',
      windowClass: 'mdlCommon receiptPreviewModal',
      centered: true,
      size: 'xl',
    });
    if (t?.file_path) this.loadPreviewBlob(t.id, 'receipt');
    if (t?.invoice_pdf_url) this.loadPreviewBlob(t.id, 'invoice');
  }

  // The S3 bucket has no CORS policy, so neither ng2-pdf-viewer's own
  // internal fetch nor a direct browser fetch() of the S3 URL can read
  // the bytes -- route through our own backend instead (same-origin-ish,
  // and we control the response headers), then hand pdf-viewer a local
  // blob URL.
  private loadPreviewBlob(chequeId: number, which: 'receipt' | 'invoice') {
    this.leaseService.getChequeFileBlob(chequeId, which).subscribe({
      next: (blob: Blob) => {
        const objectUrl = URL.createObjectURL(blob);
        if (which === 'receipt') this.previewReceiptUrl = objectUrl;
        else this.previewInvoiceUrl = objectUrl;
      },
      error: () => {
        this.alertService.error(`Failed to load ${which}.`);
      },
    });
  }

  isPdfFile(fileName: string): boolean {
    return (fileName || '').split('.').pop()?.toLowerCase() === 'pdf';
  }

  downloadTransactionInvoice(t: any) {
    if (!t.invoice_pdf_url) return;
    const link = document.createElement('a');
    link.href = t.invoice_pdf_url;
    link.download = `invoice_${t.code || t.id}.pdf`;
    link.target = '_blank';
    link.click();
  }

  downloadPreview() {
    const url = this.previewTab === 'receipt' ? this.previewReceiptUrl : this.previewInvoiceUrl;
    if (!url) return;
    const code = this.previewTransaction?.code || this.previewTransaction?.id;
    const ext = this.previewTab === 'receipt'
      ? (this.previewTransaction?.file_name?.split('.').pop() || 'pdf')
      : 'pdf';
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.previewTab}_${code}.${ext}`;
    link.click();
  }
}
