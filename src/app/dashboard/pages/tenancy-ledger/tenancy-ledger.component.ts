import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Output,
} from '@angular/core';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
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
import { EditIconComponent } from '../../component/icons/edit-icon/edit-icon.component';
import { CustomDropdownComponent } from '../../../component/custom-dropdown/custom-dropdown.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TenancyLedgerService } from '../../../tenancy-ledger.service';
import { AlertService } from '../../../shared/services/alert.service';
import { debounceTime, Subject } from 'rxjs';
import { FilterPopupButtonComponent } from '../../component/filter-popup-btn/filter-popup-btn.component';
import { FormsModule } from '@angular/forms';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { FormSelectFieldComponent } from '../../../shared/component/form-select-field/form-select-field.component';
import { SharedApiService } from '../../../shared/services/shared-api.service';
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
    TermsconditionIconComponent,
    ArrowDownIconComponent,
    ReceiptIconComponent,
    PropertySharePlatfromComponent,
    StatusActionDropdownComponent,
    NgbPopoverModule,
    EditIconComponent,
    CustomDropdownComponent,
    CustomSelectComponent,
    FilterPopupButtonComponent,
    FormsModule,
    FormSelectFieldComponent,
  ],
  templateUrl: './tenancy-ledger.component.html',
  styleUrl: './tenancy-ledger.component.css',
})
export class TenancyLedgerComponent {
  @Output() detailViewChanges = new EventEmitter<boolean>();
  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);
  propertyDetails: Record<string, any> = {};
  propertyOptions: { key: number; value: string }[] = [];
  selectedPropertyType: any = null;
  selectedStatus: any = null;
  selectedPMC: any = null;
  showReceiptDropdown = false;
  showMonthDropdown = false;
  selectedReceiptType = '';
  filterPropertyType: string | null = null;
  filterStatus: string | null = null;
  filterPMC: string | null = null;
  showDetailView: boolean = false;
  totalRecords: number = 0;
  componentName: string = 'all-properties-component';
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  private search$ = new Subject<string>();
  private sharedApiService = inject(SharedApiService);
  rowsPerPage: number = 10;
  currentPage: number = 1;
  searchText: string = '';
  propertyTypeOptions = [
    { key: 'APARTMENT', value: 'Apartment' },
    { key: 'VILLA', value: 'Villa' },
    { key: 'TOWNHOUSE', value: 'Townhouse' },
    { key: 'PENTHOUSE', value: 'Penthouse' },
    { key: 'STUDIO', value: 'Studio' },
    { key: 'OFFICE', value: 'Office' },
    { key: 'SHOP', value: 'Shop' },
    { key: 'WAREHOUSE', value: 'Warehouse' },
  ];

  statusOptions: { key: string; value: string }[] = [];
  pmcOptions: any[] = [];
  documentsByType: any = {
    EMIRATES_ID: [],
    PASSPORT_SELF: [],
    PASSPORT_FAMILY: [],
    EMPLOYMENT_PROOF: [],
    VISA_SELF: [],
    VISA_FAMILY: [],
    BANK_STATEMENT: [],
  };
  tenancyLedgerData: any[] = [];
  isLoading = false;
  selectedq: any = {
    label: 'Amount Credited',
    status: 'green',
  };
  documentActions = [
    { label: 'Share', icon: ShareIconComponent, action: 'share' },
    { label: 'Reset', icon: ResetIconComponent, action: 'reset' },
  ];
  constructor(
    private router: Router,
    private tenancyLedgerService: TenancyLedgerService,
  ) {}

  ngOnInit() {
    this.search$
      .pipe(debounceTime(400), takeUntilDestroyed(this.destroyRef))
      .subscribe((text: string) => {
        this.searchText = text.trim();
        this.currentPage = 1;
        this.loadTenancyLedger();
      });
    this.loadTenancyLedger();
    this.sharedApiService.getOptionsType([
      {
        param: 'PARENT_PROPERTY',
        key: 'property',
        setter: (v) => (this.propertyOptions = v),
      },
      {
        param: 'TENANCY_LEDGER_AGREEMENT_STATUS',
        key: 'tenancy_ledger_agreement_status',
        setter: (v) => {
          this.statusOptions = v;
        },
      },
      {
        param: 'TENANCY_STATUS',
        key: 'tenancy_status',
        setter: (v) => {
          this.pmcOptions = v;
        },
      },
    ]);
  }
  onRefresh() {
    this.loadTenancyLedger();
  }
  searchTextChange(text: string): void {
    this.search$.next(text);
  }

  handleExportClick() {
    const params: Record<string, any> = {};
    if (this.searchText) params['search'] = this.searchText;
    this.tenancyLedgerService
      .exportTenacyLedger(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tenancyLedger.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        this.alertService.success('Exported successfully');
      });
  }
  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
  }
  clearPropertyType() {
    this.selectedPropertyType = null;
    this.filterPropertyType = null;
    this.applyFilter();
  }

  clearStatus() {
    this.selectedStatus = null;
    this.filterStatus = null;
    this.applyFilter();
  }

  clearPMC() {
    this.selectedPMC = null;
    this.filterPMC = null;
    this.applyFilter();
  }

  handleDropdownAction(action: string, row: any): void {
    if (action === 'share') {
      this.shareTenancyLedger(row.lease_id);
    }
  }

  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
  }

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

  buildParams(): Record<string, any> {
    const params: Record<string, any> = {
      page: this.currentPage,
      page_size: this.rowsPerPage,
    };
    if (this.searchText) params['search'] = this.searchText;
    if (this.filterPropertyType)
      params['property_id'] = this.filterPropertyType;
    if (this.filterStatus) params['agreement_status'] = this.filterStatus;
    if (this.filterPMC) params['property_status'] = this.filterPMC;
    return params;
  }
  loadTenancyLedger(): void {
    this.isLoading = true;

    this.tenancyLedgerService
      .getTenancyLedger(this.buildParams())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          console.log('Tenancy Ledger Response:', resp);

          this.tenancyLedgerData = resp?.content ?? [];

          this.totalRecords =
            resp?.content?.pagination?.total_records ??
            this.tenancyLedgerData.length;

          this.isLoading = false;
        },

        error: (error) => {
          console.error('Tenancy Ledger API Error:', error);

          this.tenancyLedgerData = [];
          this.totalRecords = 0;
          this.isLoading = false;
        },
      });
  }
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

  toggleReceipt() {
    this.showReceiptDropdown = !this.showReceiptDropdown;
    this.showMonthDropdown = false;
    this.detailViewChanges.emit(true);
  }
  removeFilter(): void {
    this.filterPropertyType = null;
    this.filterStatus = null;
    this.filterPMC = null;
    this.selectedPropertyType = null;
    this.selectedStatus = null;
    this.selectedPMC = null;
    this.currentPage = 1;
    this.loadTenancyLedger();
  }
  applyFilter(): void {
    this.currentPage = 1;
    this.loadTenancyLedger();
  }

  selectReceiptType(type: string) {
    this.selectedReceiptType = type;
    this.showMonthDropdown = true;
    this.detailViewChanges.emit(false);
  }
  shareTenancyLedger(leaseId: number): void {
    this.tenancyLedgerService
      .shareTenancyLedger(leaseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.alertService.success('Tenancy ledger shared successfully');
        },
        error: (error: any) => {
          this.alertService.error('Failed to share tenancy ledger');
        },
      });
  }
}
