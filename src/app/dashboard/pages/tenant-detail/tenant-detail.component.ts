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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  NgbDropdownModule,
  NgbModal,
  NgbPopoverModule,
} from '@ng-bootstrap/ng-bootstrap';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TenantsService } from '../../services/tenants.service';
import { LeaseService } from '../../services/lease.service';
import { NoDataComponent } from '../../../no-data/no-data.component';

import { TableViewCardComponent } from '../../component/table-view-card/table-view-card.component';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
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

@Component({
  selector: 'app-tenant-detail',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgbPopoverModule,
    TableViewCardComponent,
    WhiteCardComponent,
    TableTitleComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
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

  tenantData: any = null;
  rentTransactions: any[] = [];
  additionalTransactions: any[] = [];

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
    this.leaseService
      .getLeaseCheques(leaseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.rentTransactions = resp?.content?.all_cheques ?? [];
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
    this.loadTransactions(this.selectedLease.id);
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
}
