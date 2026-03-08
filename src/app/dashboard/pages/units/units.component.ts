import { Component, EventEmitter, Output, output } from '@angular/core';
import { TablePaginationComponent } from '../../component/table-pagination/table-pagination.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { EditIconComponent } from '../../../user/component/icons/edit-icon/edit-icon.component';
import { TableActionDropdownComponent } from '../../component/table-action-dropdown/table-action-dropdown.component';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { TranslateModule } from '@ngx-translate/core';
import { ResetIconComponent } from '../../component/icons/reset-icon/reset-icon.component';
import { ShareIconComponent } from '../../component/icons/share-icon/share-icon.component';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { CommonModule } from '@angular/common';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { PropertyViewCardComponent } from '../../component/property-view-card/property-view-card.component';
import { DocumentTypeItemComponent } from '../../component/document-type-item/document-type-item.component';
import { Router } from '@angular/router';
import { PropertySharePlatfromComponent } from '../../property-share-platfrom/property-share-platfrom.component';
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
  selector: 'app-units',
  standalone: true,
  imports: [
    TablePaginationComponent,
    TableSelectComponent,
    EditIconComponent,
    TableActionDropdownComponent,
    TableImgItemComponent,
    SortingIconComponent,
    ExportIconComponent,
    TableFilterButtonComponent,
    FilterIconComponent,
    TableSearchComponent,
    TableTitleComponent,
    TranslateModule,
    CommonModule,
    WhiteCardComponent,
    PropertyViewCardComponent,
    DocumentTypeItemComponent,
    PropertySharePlatfromComponent,
  ],
  templateUrl: './units.component.html',
  styleUrl: './units.component.css',
})
export class UnitsComponent {
  totalRecords: number = 0;
  showDetailView: boolean = false;
  componentName: string = 'all-properties-component';
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  documentActions = [
    { label: 'Share', icon: ShareIconComponent, action: 'share' },
    { label: 'Reset', icon: ResetIconComponent, action: 'reset' },
  ];
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

  handleDropdownAction(action: string) {
    console.log(`${action} action clicked`);
  }

  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
  }
  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
  }

  /*--------property details view section-----------------------------------------------------------*/
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
  onEditClick() {
    this.router.navigate(['/dashboard/new-units']);
  }
}
