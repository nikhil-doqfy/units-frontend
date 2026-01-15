import { Component, DestroyRef, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeService, UserRole } from '../../../theme.service';

import { PlusIconComponent } from '../../../shared/component/icons/plus-icon/plus-icon.component';
import { RefreshIconComponent } from '../../component/icons/refresh-icon/refresh-icon.component';
import { TableTitleComponent } from '../../../dashboard/component/table-title/table-title.component';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { BadgeComponent } from '../../component/badge/badge.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../../dashboard/component/table-filter-btn/table-filter-btn.component';
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { TableActionDropdownComponent } from '../../component/table-action-dropdown/table-action-dropdown.component';
import { ShareIconComponent } from '../../component/icons/share-icon/share-icon.component';
import { ResetIconComponent } from '../../component/icons/reset-icon/reset-icon.component';
import { TablePaginationComponent } from '../../../dashboard/component/table-pagination/table-pagination.component';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { DocumentTypeItemComponent } from '../../component/document-type-item/document-type-item.component';
import { PropertyViewCardComponent } from '../../component/property-view-card/property-view-card.component';
import { CardTitleComponent } from '../../../shared/component/card-title/card-title.component';
import { DashTitleComponent } from '../../../shared/component/dash-title/dash-title.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PropertyService } from '../../services/property.service';
import { debounceTime, Subject } from 'rxjs';
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../shared/model/shared.model';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { SharedService } from '../../../shared.service';
import { AlertService } from '../../../shared/services/alert.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FilterPopupButtonComponent } from '../../component/filter-popup-btn/filter-popup-btn.component';
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
  selector: 'app-properties',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PlusIconComponent,
    RefreshIconComponent,
    TableTitleComponent,
    TableImgItemComponent,
    BadgeComponent,
    TableSelectComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    FilterIconComponent,
    CustomSelectComponent,
    ExportIconComponent,
    TableActionButtonComponent,
    TableActionDropdownComponent,
    TablePaginationComponent,
    SortingIconComponent,
    WhiteCardComponent,
    DocumentTypeItemComponent,
    PropertyViewCardComponent,
    CardTitleComponent,
    DashTitleComponent,
    TranslateModule,
    NoDataComponent,
    FilterPopupButtonComponent,
  ],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.css',
})
export class PropertiesComponent {
  private propertyService = inject(PropertyService);
  private sharedApiService = inject(SharedApiService);
  private alertService = inject(AlertService);
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  private destroyRef = inject(DestroyRef);
  private translate = inject(TranslateService);

  componentName: string = 'PropertiesComponent';
  breadcrumbData: BreadCrumb[] = [];
  currentRole: UserRole = 'owner';
  propertyView: 'my-properties' | 'all-properties' = 'all-properties';
  selected: string = 'Falcom city';
  documentActions = [
    { label: 'Share', icon: ShareIconComponent, action: 'share' },
    { label: 'Reset', icon: ResetIconComponent, action: 'reset' },
  ];
  showDetailView: boolean = false;
  rentalStatus: any = [];
  propertiesList: any[] = [];
  propertyDetails: Record<string, any> = {};
  selectedrentalstatus: any = null;
  propertiesFilter: Record<string, any> = {};
  totalRecords: number = 0;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;
  currentLanguage = 'en';
  currentPropertyId!: number;
  propertyDocumentType: any[] = [];
  propertyDocuments: Record<string, any[]> = {};
  activeDocTypeKey!: string;

  private onPropertySearch$ = new Subject<string>();

  constructor(private router: Router, private themeService: ThemeService) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.currentPropertyId = +id;
      this.propertiesFilter['property_id'] = +id;
      this.showDetailView = true;
    }
  }

  ngOnInit() {
    this.loadBreadcrumb();
    this.sharedService.initLanguage();

    this.initLanguageListener();
    this.initPropertySearchListener();
    this.getProperties();
    this.currentRole = this.themeService.getRole();
    if (this.currentRole === 'tenant' && !this.currentPropertyId) {
      this.propertyView = 'my-properties';
      this.propertiesFilter['MY_PROPERTY'] = true;
    }
    this.getOptionTypes();
  }

  changeLanguage(lang: string) {
    this.sharedService.setLanguage(lang);
  }

  getOptionTypes() {
    if (this.showDetailView || this.propertyView === 'my-properties') {
      this.sharedApiService.getOptionsType([
        {
          param: 'PROPERTY_DOCUMENT_CHOICE',
          key: 'Property_Document',
          setter: (v) => {
            (this.propertyDocumentType = v), this.getProperties();
          },
        },
      ]);
    }
  }

  getTenancyStatusOptions() {
    this.sharedApiService.getOptionsType([
      {
        param: 'TENANCY_STATUS',
        key: 'tenancy_status',
        setter: (v) => (this.rentalStatus = v),
      },
    ]);
  }

  onRentalTenancyClick() {
    this.getTenancyStatusOptions();
  }
  initLanguageListener() {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadBreadcrumb();
      });
  }

  loadBreadcrumb() {
    if (this.showDetailView) {
      this.setBreadCrumb([
        { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
        { label: 'PAGE_TITLE.PROPERTIES', link: '/dashboard/properties' },
        { label: 'PROPERTY_DETAILS', link: '' },
      ]);
    } else {
      this.setBreadCrumb([
        { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
        { label: 'PAGE_TITLE.PROPERTIES', link: '' },
      ]);
    }
  }

  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }

  onPropertyViewChange() {
    if (this.propertyView === 'all-properties') {
      delete this.propertiesFilter['property_id'];
      delete this.propertiesFilter['MY_PROPERTY'];
    } else if (this.propertyView === 'my-properties') {
      delete this.propertiesFilter['property_id'];
      this.propertiesFilter['MY_PROPERTY'] = true;
    }
    this.getOptionTypes();
    this.getProperties();
  }

  private getProperties() {
    this.propertiesFilter = {
      ...this.propertiesFilter,
      limit: this.rowsPerPage,
      page: this.currentPage,
    };

    this.propertyService
      .getProperties(this.propertiesFilter)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          if (this.propertyView === 'my-properties' || this.showDetailView) {
            this.propertyDetails = response?.content ?? {};
            this.handlePropertyDetails();
          } else {
            this.propertiesList = response?.content ?? [];
            this.totalRecords = response?.pagination?.total_records ?? 0;
          }
        },
      });
  }

  onRefresh() {
    this.getProperties();
  }

  initPropertySearchListener() {
    this.onPropertySearch$
      .pipe(debounceTime(1000), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value?.trim()) this.propertiesFilter['search'] = value.trim();
        else delete this.propertiesFilter['search'];

        this.currentPage = 1;
        this.getProperties();
      });
  }

  searchTextChange(search: string): void {
    this.onPropertySearch$.next(search);
  }

  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.getProperties();
  }

  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.getProperties();
  }

  getAgreementExpirationStatusColor(status: string): string {
    if (!status) return '';

    let colorMapimg: any = {
      Expired: 'red',
      'About to Expire': 'orange',
      Ongoing: 'green',
    };

    return colorMapimg[status];
  }

  removeFilter() {
    this.selectedrentalstatus = null;
    delete this.propertiesFilter['tenancy_status'];

    this.currentPage = 1;
    this.getProperties();
  }

  property: PropertyDetails = {
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

  getBasicDetailsOfProperty(data: Record<string, any>) {
    return {
      name: `${data?.['property_unit']?.['property_unit_name']}, ${data?.['parent_property']?.['property_name']}`,
      location: `${data?.['parent_property']?.['state']?.['value']}, ${data?.['parent_property']?.['city']?.['value']}`,
      status: data?.['property_unit']?.['status'] || 'N/A',
      rent: data?.['property_unit']?.['commercial_details']?.['rent'] ?? 'N/A',
      bhk: data?.['property_unit']?.['dimension'] || 'N/A',
      sqft: data?.['property_unit']?.['area_of_property'] ?? 'N/A',
    };
  }

  getPropertyImages(data: Record<string, any>): PropertyImages[] {
    const images = data?.['images'].map((img: any) => ({ imgSrc: img.url }));

    return images.length
      ? images
      : Array.from({ length: 5 }).map((_, i) => ({
          imgSrc: 'assets/property/property-img-default.svg',
        }));
  }

  getOtherDetailsOfProperty(data: Record<string, any>): Section[] {
    return [
      {
        title: 'Property details',
        items: [
          {
            label: 'Phone Number',
            value: data?.['owner']?.['contact_number'] || 'N/A',
          },
          {
            label: 'Property Code',
            value: data?.['property_unit']?.['property_code'] || 'N/A',
          },
          {
            label: 'City',
            value: data?.['parent_property']?.['city']?.['value'] || 'N/A',
          },
          {
            label: 'Locality',
            value: data?.['parent_property']?.['locality'] || 'N/A',
          },
          {
            label: 'Postal Code',
            value: data?.['parent_property']?.['postal_code'] || 'N/A',
          },
          {
            label: 'Address Line 1',
            value: data?.['property_unit']?.['address'] || 'N/A',
          },
          {
            label: 'Address Line 2 ',
            value: data?.['parent_property']?.['additional_address'] || 'N/A',
          },
        ],
      },
      {
        title: 'Property Costing',
        items: [
          {
            label: 'Rent Cost',
            value:
              data?.['property_unit']?.['commercial_details']?.['rent'] ??
              'N/A',
          },
        ],
      },
      {
        title: 'Tenant details',
        items: [
          {
            label: 'Name',
            value: `${data?.['tenant']?.['first_name']} ${data?.['tenant']?.['last_name']}`,
          },
          { label: 'Email', value: data?.['tenant']?.['email'] || 'N/A' },
          {
            label: 'Phone Number',
            value: data?.['tenant']?.['contact_number'] || 'N/A',
          },
          {
            label: 'Emirates ID',
            value: data?.['tenant']?.['emirate_id'] || 'N/A',
          },
          {
            label: 'City',
            value: data?.['tenant']?.['city']?.['value'] || 'N/A',
          },
          { label: 'Locality', value: data?.['tenant']?.['locality'] || 'N/A' },
          {
            label: 'Postal Code',
            value: data?.['tenant']?.['postal_code'] || 'N/A',
          },
          {
            label: 'Address Line 1',
            value: data?.['tenant']?.['address'] || 'N/A',
          },
          {
            label: 'Address Line 2',
            value: data?.['tenant']?.['additional_address'] || 'N/A',
          },
        ],
      },
      {
        title: 'Owner details',
        items: [
          {
            label: 'Name',
            value: `${data?.['owner']?.['first_name']} ${data?.['owner']?.['last_name']}`,
          },
          {
            label: 'Emirates ID',
            value: data?.['postal_code']?.['emirate_id'] || 'N/A',
          },
          {
            label: 'Residence Visa',
            value: data?.['postal_code']?.['uae_residence_visa'] || 'N/A',
          },
          {
            label: 'Trade License',
            value: data?.['postal_code']?.['trade_license'] || 'N/A',
          },
          {
            label: 'Owner Code',
            value: data?.['postal_code']?.['owner_code'] || 'N/A',
          },
        ],
      },
    ];
  }

  handlePropertyDetails() {
    let basicDetails = this.getBasicDetailsOfProperty(this.propertyDetails);
    let propertyImages = this.getPropertyImages(this.propertyDetails);
    let sections = this.getOtherDetailsOfProperty(this.propertyDetails);
    this.property = { ...basicDetails, propertyImages, sections };

    this.propertyDocumentType.forEach(
      (type: any) => (this.propertyDocuments[type.key] = [])
    );

    this.activeDocTypeKey = this.propertyDocumentType[0]?.key;

    this.propertyDetails?.['documents'].map((doc: any) => {
      if (this.propertyDocuments[doc.type]) {
        this.propertyDocuments[doc.type].push(doc);
      } else {
        // this.propertyDocuments[doc.type] = [doc];
      }
    });
  }

  onDocTabClick(type: any) {
    this.activeDocTypeKey = type.key;
  }

  onOptionSelected(option: string) {
    this.selected = option;
  }

  goToAddProperty(): void {
    this.router.navigate(['/dashboard/add-property']);
  }

  handleDropdownAction(action: string) {
    console.log(`${action} action clicked`);
  }

  applyFilter() {
    this.propertiesFilter['tenancy_status'] = this.selectedrentalstatus.key;
    this.currentPage = 1;
    this.getProperties();
  }

  handleExportClick(): void {
    this.propertyService
      .getExcelFileOfProperty({})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        const url = window.URL.createObjectURL(resp);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'property_export.csv';
        a.click();

        window.URL.revokeObjectURL(url);
        this.alertService.success('File downloaded successfully!');
      });
  }

  handleEditClick(propertyId: number): void {
    if (!propertyId) {
      throw new Error('Property ID not found!');
    }
    this.router.navigate(['/dashboard/edit-property', propertyId]);
  }

  handleDeleteClick(): void {
    console.log('Delete button clicked');
  }

  handleBackClick(): void {
    this.showDetailView = false;
    this.router.navigate(['/dashboard/properties']);
  }

  handleViewClick(propertyId: number): void {
    if (!propertyId) {
      throw new Error('Property ID not found!');
    }
    this.router.navigate(['/dashboard/property/details/', propertyId]);
  }
}
