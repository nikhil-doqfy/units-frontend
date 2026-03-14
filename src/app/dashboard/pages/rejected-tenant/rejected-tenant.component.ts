import { Component, EventEmitter, inject, Output } from '@angular/core';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TablePaginationComponent } from '../../component/table-pagination/table-pagination.component';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { ShareIconComponent } from '../../component/icons/share-icon/share-icon.component';
import { ResetIconComponent } from '../../component/icons/reset-icon/reset-icon.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { TableViewCardComponent } from '../../component/table-view-card/table-view-card.component';
import { RefreshIconComponent } from '../../component/icons/refresh-icon/refresh-icon.component';
import { DisableIconComponent } from '../../../icon/disable-icon/disable-icon.component';
import { CommonModule } from '@angular/common';
import { InvoiceIconComponent } from '../../../icons/invoice-icon/invoice-icon.component';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { DocumentTypeItemComponent } from '../../component/document-type-item/document-type-item.component';
import { AreaGraphComponent } from '../../component/charts/area-graph/area-graph.component';
import { ReceiptIconComponent } from '../../../icons/receipt-icon/receipt-icon.component';
import { ArrowDownIconComponent } from '../../../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { BadgeComponent } from '../../component/badge/badge.component';
import { StatusDropdownComponent } from '../../component/status-dropdown/status-dropdown.component';
import { TermsconditionIconComponent } from '../../../icons/termscondition-icon/termscondition-icon.component';
import { CustomSelectComponent } from '../../../auth/component/custom-select/custom-select.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rejected-tenant',
  standalone: true,
  imports: [
    TableSelectComponent,
    TablePaginationComponent,
    TableImgItemComponent,
    SortingIconComponent,
    TranslateModule,
    TableFilterButtonComponent,
    TableSearchComponent,
    TableTitleComponent,
    ExportIconComponent,
    TableActionButtonComponent,
    TableViewCardComponent,
    RefreshIconComponent,
    DisableIconComponent,
    TranslateModule,
    CommonModule,
    InvoiceIconComponent,
    WhiteCardComponent,
    DocumentTypeItemComponent,
    AreaGraphComponent,
    ReceiptIconComponent,
    ArrowDownIconComponent,
    FilterIconComponent,
    BadgeComponent,
    TermsconditionIconComponent,
    CustomSelectComponent,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './rejected-tenant.component.html',
  styleUrl: './rejected-tenant.component.css',
})
export class RejectedTenantComponent {
  @Output() detailViewChanges = new EventEmitter<boolean>();

  totalRecords: number = 0;
  rowsPerPage: number = 10;
  componentName: string = 'TenantsComponent';
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
  leases: any[] = [];
  private translate = inject(TranslateService);
  selectedFilter = 'approval';
  constructor(private router: Router) {}
  ngOnChanges() {
    this.applyFilter();
  }
  toggleMenu() {
    this.showMenu = !this.showMenu;
  }
  applyFilter() {
    console.log(this.selectedFilter);
  }
  getLabel(key: string): string {
    return this.translate.instant(key);
  }
  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
  }

  onViewInvoiceClick(lease: any, event: Event) {
    event.preventDefault();
    this.selectedLease = lease;
    this.showInvoiceDetails = true;
    this.showDetailView = false;
    console.log('Invoice Details for:', lease);
  }
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
  selectedq: any = {
    label: 'Amount Credited',
    status: 'green',
  };
  onLeaseClick(lease: any) {
    this.selectedLease = lease;
    this.showDetailView = true;
    this.showInvoiceDetails = false;
    console.log('clicked');
    this.detailViewChanges.emit(true);
  }
  toggleReceipt() {
    this.showReceiptDropdown = !this.showReceiptDropdown;
    this.showMonthDropdown = false;
  }
  handleBackClick() {
    this.showDetailView = false;
    this.router.navigate(['/dashboard/tenants']);
    this.detailViewChanges.emit(false);
  }
  selectReceiptType(type: string) {
    this.selectedReceiptType = type;
    this.showMonthDropdown = true;
  }
}
