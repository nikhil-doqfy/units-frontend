import { Component, EventEmitter, Output } from '@angular/core';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { EditIconComponent } from '../../../shared/component/icons/edit-icon1/edit-icon.component';
import { TableActionDropdownComponent } from '../../component/table-action-dropdown/table-action-dropdown.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TablePaginationComponent } from '../../component/table-pagination/table-pagination.component';
import { TranslateModule } from '@ngx-translate/core';
import { ResetIconComponent } from '../../component/icons/reset-icon/reset-icon.component';
import { ShareIconComponent } from '../../component/icons/share-icon/share-icon.component';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../component/badge/badge.component';
import { RentalAmountComponent } from '../../component/rental-amount/rental-amount.component';
import { PlatfromCellComponent } from '../../component/platfrom-cell/platfrom-cell.component';
import { DocumentTypeItemComponent } from '../../component/document-type-item/document-type-item.component';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { PropertyViewCardComponent } from '../../component/property-view-card/property-view-card.component';
import { Router } from '@angular/router';
import { StatusDropdownComponent } from '../../component/status-dropdown/status-dropdown.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { TermsconditionIconComponent } from '../../../icons/termscondition-icon/termscondition-icon.component';
import { ArrowDownIconComponent } from '../../../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
import { ReceiptIconComponent } from '../../../icons/receipt-icon/receipt-icon.component';
import { PropertySharePlatfromComponent } from '../../property-share-platfrom/property-share-platfrom.component';
import { StatusActionDropdownComponent } from '../../../status-action-dropdown/status-action-dropdown.component';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
type PropertyImages = Record<'imgSrc', string>;
interface SectionItems {
  label: string;
  value: string;
}
interface Section {
  title: string;
  items: SectionItems[];
}
interface PropertyDetails {
  property_unit_id: number;
  name: string;
  location: string;
  status: string;
  rent: string;
  bhk: string;
  sqft: string;
  propertyImages: PropertyImages[];
  sections: Section[];
}
@Component({
  selector: 'app-tenancy-ledger',
  standalone: true,
  imports: [
    TableTitleComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    FilterIconComponent,
    ExportIconComponent,
    SortingIconComponent,
    TableImgItemComponent,
    EditIconComponent,
    TableActionDropdownComponent,
    TableSelectComponent,
    TablePaginationComponent,
    TranslateModule,
    CommonModule,
    BadgeComponent,
    RentalAmountComponent,
    DocumentTypeItemComponent,
    WhiteCardComponent,
    PropertyViewCardComponent,
    TableActionButtonComponent,
    TermsconditionIconComponent,
    ArrowDownIconComponent,
    ReceiptIconComponent,
    PropertySharePlatfromComponent,
    StatusActionDropdownComponent,
    NgbPopoverModule,
  ],
  templateUrl: './tenancy-ledger.component.html',
  styleUrl: './tenancy-ledger.component.css',
})
export class TenancyLedgerComponent {
  showDetailView: boolean = false;
  totalRecords: number = 0;
  componentName: string = 'all-properties-component';
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;
  documentsByType: any = {
    EMIRATES_ID: [],
    PASSPORT_SELF: [],
    PASSPORT_FAMILY: [],
    EMPLOYMENT_PROOF: [],
    VISA_SELF: [],
    VISA_FAMILY: [],
    BANK_STATEMENT: [],
  };
  onRefresh() {}
  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
  }

  documentActions = [
    { label: 'Share', icon: ShareIconComponent, action: 'share' },
    { label: 'Reset', icon: ResetIconComponent, action: 'reset' },
  ];
  handleDropdownAction(action: string) {
    console.log(`${action} action clicked`);
  }
  selectedq: any = {
    label: 'Amount Credited',
    status: 'green',
  };

  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
  }
  @Output() detailViewChanges = new EventEmitter<boolean>();

  constructor(private router: Router) {}
  propertyDetails: Record<string, any> = {};
  property: PropertyDetails = {
    property_unit_id: 1,
    name: '--',
    location: '--',
    status: '--',
    rent: '--',
    bhk: '--',
    sqft: '--',
    propertyImages: [
      {
        imgSrc: 'assets/property/property-img-default.svg',
      },
      {
        imgSrc: 'assets/property/property-img-default.svg',
      },
      {
        imgSrc: 'assets/property/property-img-default.svg',
      },
      {
        imgSrc: 'assets/property/property-img-default.svg',
      },
      {
        imgSrc: 'assets/property/property-img-default.svg',
      },
    ],
    sections: [
      {
        title: 'Property details',
        items: [
          { label: 'Phone Number', value: '--' },
          { label: 'Property Code', value: '--' },
          { label: 'City', value: '--' },
          { label: 'Locality', value: '--' },
          { label: 'Postal Code', value: '--' },
          { label: 'Address Line 1', value: '--' },
          { label: 'Address Line 2 ', value: '--' },
        ],
      },
      {
        title: 'Property Costing',
        items: [{ label: 'Rent Cost', value: '--' }],
      },
      {
        title: 'Tenant details',
        items: [
          { label: 'Name', value: '--' },
          { label: 'Email', value: '--' },
          { label: 'Phone Number', value: '--' },
          { label: 'Emirates ID', value: '--' },
          { label: 'City', value: '--' },
          { label: 'Locality', value: '--' },
          { label: 'Postal Code', value: '--' },
          { label: 'Address Line 1', value: '--' },
          { label: 'Address Line 2', value: '--' },
        ],
      },
      {
        title: 'Owner details',
        items: [
          { label: 'Name', value: '--' },
          { label: 'Emirates ID', value: '--' },
          { label: 'Residence Visa', value: '--' },
          { label: 'Trade License', value: '--' },
          { label: 'Owner Code', value: '--' },
        ],
      },
    ],
  };
  handleViewClick(property_unit_id: number) {
    this.property.property_unit_id = property_unit_id;
    console.log('clicked id:', property_unit_id);
    this.showDetailView = true;
    this.detailViewChanges.emit(true);
  }
  handleBackClick(): void {
    this.showDetailView = false;
    this.router.navigate(['/dashboard/properties']);
    this.detailViewChanges.emit(false);
  }
  showReceiptDropdown = false;
  showMonthDropdown = false;
  selectedReceiptType = '';
  toggleReceipt() {
    this.showReceiptDropdown = !this.showReceiptDropdown;
    this.showMonthDropdown = false;
    this.detailViewChanges.emit(true);
  }
  selectReceiptType(type: string) {
    this.selectedReceiptType = type;
    this.showMonthDropdown = true;
    this.detailViewChanges.emit(false);
  }
}
