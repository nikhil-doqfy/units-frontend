import {
  Component,
  EventEmitter,
  inject,
  Output,
  TemplateRef,
} from '@angular/core';
import { TablePaginationComponent } from '../../component/table-pagination/table-pagination.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TableActionDropdownComponent } from '../../component/table-action-dropdown/table-action-dropdown.component';
import { BadgeComponent } from '../../component/badge/badge.component';
import { PlatfromBadgeComponent } from '../../component/platfrom-badge/platfrom-badge.component';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { ShareIconComponent } from '../../component/icons/share-icon/share-icon.component';
import { ResetIconComponent } from '../../component/icons/reset-icon/reset-icon.component';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { CustomSelectComponent } from '../../../auth/component/custom-select/custom-select.component';
import { TableViewCardComponent } from '../../component/table-view-card/table-view-card.component';
import { CommonModule } from '@angular/common';
import { RefreshIconComponent } from '../../component/icons/refresh-icon/refresh-icon.component';
import { DisableIconComponent } from '../../../icon/disable-icon/disable-icon.component';
import { InvoiceIconComponent } from '../../../icons/invoice-icon/invoice-icon.component';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { DocumentTypeItemComponent } from '../../component/document-type-item/document-type-item.component';
import { AreaGraphComponent } from '../../component/charts/area-graph/area-graph.component';
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { TermsconditionIconComponent } from '../../../icons/termscondition-icon/termscondition-icon.component';
import { ReceiptIconComponent } from '../../../icons/receipt-icon/receipt-icon.component';
import { ArrowDownIconComponent } from '../../../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { StatusActionDropdownComponent } from '../../../status-action-dropdown/status-action-dropdown.component';
import { ChnagePaymentModeFormComponent } from '../../component/forms/chnage-payment-mode-form/chnage-payment-mode-form.component';
import { ReplaceChequeComponent } from '../../component/forms/replace-cheque/replace-cheque.component';
import { ReceiptComponent } from '../../component/forms/receipt/receipt.component';
import { BlockIconComponent } from '../../../icons/block-icon/block-icon.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-current-tenant',
  standalone: true,
  imports: [
    TablePaginationComponent,
    TableSelectComponent,
    BadgeComponent,
    TableImgItemComponent,
    TableTitleComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    ExportIconComponent,
    TranslateModule,
    SortingIconComponent,
    CustomSelectComponent,
    TableViewCardComponent,
    CommonModule,
    RefreshIconComponent,
    DisableIconComponent,
    InvoiceIconComponent,
    WhiteCardComponent,
    DocumentTypeItemComponent,
    AreaGraphComponent,
    FilterIconComponent,
    TableActionButtonComponent,
    TermsconditionIconComponent,
    ReceiptIconComponent,
    ArrowDownIconComponent,
    NgbPopoverModule,
    StatusActionDropdownComponent,
    ChnagePaymentModeFormComponent,
    ReplaceChequeComponent,
    ReceiptComponent,
    BlockIconComponent,
  ],
  templateUrl: './current-tenant.component.html',
  styleUrl: './current-tenant.component.css',
})
export class CurrentTenantComponent {
  @Output() detailViewChanges = new EventEmitter<boolean>();
  totalRecords: number = 0;
  rowsPerPage: number = 10;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  currentPage: number = 1;
  showDetailView: boolean = false;
  showMenu = false;
  selectedLease: any = null;
  showInvoiceDetails = false;
  showReceiptDropdown = false;
  showMonthDropdown = false;
  selectedReceiptType = '';
  totalAmount = 'AED 2,000.00';
  receivedAmount = 'AED 1,200.00';
  pendingAmount = 'AED 800.00';
  private translate = inject(TranslateService);
  leases: any[] = [];
  private modalService = inject(NgbModal);
  constructor(private router: Router) {}
  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
  }
  componentName: string = 'TenantsComponent';
  onRefresh() {}
  documentActions = [
    { label: 'Share', icon: ShareIconComponent, action: 'share' },
    { label: 'Reset', icon: ResetIconComponent, action: 'reset' },
  ];
  handleDropdownAction(action: string) {
    console.log(`${action} action clicked`);
  }
  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
  }
  onLeaseClick(lease: any) {
    this.selectedLease = lease;
    this.showDetailView = true;
    this.showInvoiceDetails = false;
    console.log('clicked');
    this.detailViewChanges.emit(true);
    // this.showRenewalBlockedMsg = true;
  }
  toggleReceipt() {
    this.showReceiptDropdown = !this.showReceiptDropdown;
    this.showMonthDropdown = false;
  }
  getLabel(key: string): string {
    return this.translate.instant(key);
  }
  selectReceiptType(type: string) {
    this.selectedReceiptType = type;
    this.showMonthDropdown = true;
  }
  onViewInvoiceClick(lease: any, event: Event) {
    event.preventDefault();
    this.selectedLease = lease;
    this.showInvoiceDetails = true;
    this.showDetailView = false;
    console.log('Invoice Details for:', lease);
    this.detailViewChanges.emit(true);
  }
  openChangePayementModeModal(addTenantContent: TemplateRef<any>) {
    const modalRef = this.modalService.open(addTenantContent, {
      ariaLabelledBy: 'modal-title',
      windowClass: 'mdlCommon',
      centered: true,
    });
  }
  openreplaceChequeModal(replaceChequeContent: TemplateRef<any>) {
    const modalRef = this.modalService.open(replaceChequeContent, {
      ariaLabelledBy: 'modal-title',
      windowClass: 'mdlCommon replaceChequeModel',
      centered: true,
      size: '900px',
    });
  }
  openReceiptModal(receiptContent: TemplateRef<any>) {
    const modalRef = this.modalService.open(receiptContent, {
      ariaLabelledBy: 'modal-title',
      windowClass: 'mdlCommon',
      centered: true,
      size: 'xl',
    });
  }
  toggleMenu() {
    this.showMenu = !this.showMenu;
  }
  showRenewalBlockedMsg = false;

  showMsg() {
    this.showDetailView = true;
    this.showRenewalBlockedMsg = true;
  }
  hideMsg() {
    this.showRenewalBlockedMsg = false;
  }
  handleBackClick(): void {
    this.showDetailView = false;
    this.router.navigate(['/dashboard/tenants']);
    this.detailViewChanges.emit(false);
  }
  handleCloseClick() {
    this.showInvoiceDetails = false;
    this.router.navigate(['/dashboard/tenants']);
    this.detailViewChanges.emit(false);
  }
}
