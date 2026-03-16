import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

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
  ],
  templateUrl: './tenant-detail.component.html',
  styleUrl: './tenant-detail.component.css',
})
export class TenantDetailComponent {
  @Input() selectedLease: any = null;
  @Output() back  = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  private translate    = inject(TranslateService);
  private modalService = inject(NgbModal);

  // ── view state ──────────────────────────────────────────────────
  showInvoiceDetails   = false;
  showRenewalBlockedMsg = false;
  showMenu             = false;
  showReceiptDropdown  = false;
  showMonthDropdown    = false;
  selectedReceiptType  = '';

  // ── summary (static placeholders, replace with real data later) ─
  totalAmount    = 'AED 2,000.00';
  receivedAmount = 'AED 1,200.00';
  pendingAmount  = 'AED 800.00';

  componentName      = 'TenantDetailComponent';
  totalRecords       = 0;
  rowsPerPage        = 10;
  rowsPerPageOptions = [10, 25, 50, 100];
  currentPage        = 1;

  // ── helpers ─────────────────────────────────────────────────────
  getLabel(key: string): string {
    return this.translate.instant(key);
  }

  toggleMenu() { this.showMenu = !this.showMenu; }

  showMsg()  { this.showRenewalBlockedMsg = true; }
  hideMsg()  { this.showRenewalBlockedMsg = false; }

  toggleReceipt() {
    this.showReceiptDropdown = !this.showReceiptDropdown;
    this.showMonthDropdown   = false;
  }

  selectReceiptType(type: string) {
    this.selectedReceiptType = type;
    this.showMonthDropdown   = true;
  }

  onViewInvoiceClick(lease: any, event: Event) {
    event.preventDefault();
    this.selectedLease     = lease;
    this.showInvoiceDetails = true;
  }

  handleBackClick() {
    this.showInvoiceDetails   = false;
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
