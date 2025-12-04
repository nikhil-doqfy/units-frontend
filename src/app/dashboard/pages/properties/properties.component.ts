import { Component, DestroyRef, inject } from '@angular/core';
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
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { SharedService } from '../../../shared.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  ],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.css',
})
export class PropertiesComponent {
  private propertyService = inject(PropertyService);

  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);

  componentName: string = 'PropertiesComponent';
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Properties', link: '' },
  ];

  currentRole: UserRole = 'owner';
  propertyView: 'my-properties' | 'all-properties' = 'all-properties';
  selected: string = 'Falcom city';

  documentActions = [
    { label: 'Share', icon: ShareIconComponent, action: 'share' },
    { label: 'Reset', icon: ResetIconComponent, action: 'reset' },
  ];

  showDetailView: boolean = false;

  propertiesList: any[] = [];
  propertiesFilter: Record<string, any> = {};
  totalRecords: number = 0;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;
  private onPropertySearch$ = new Subject<string>();
  private destroyRef = inject(DestroyRef);
  private translate = inject(TranslateService);
  currentLanguage = 'en';
  constructor(private router: Router, private themeService: ThemeService) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
    this.onPropertySearch$
      .pipe(debounceTime(1000), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value?.trim()) this.propertiesFilter['search'] = value.trim();
        else delete this.propertiesFilter['search'];

        this.currentPage = 1;
        this.getProperties();
      });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.propertiesFilter['property_id'] = +id;
      this.showDetailView = true;
      this.getProperties();
    }
  }

  ngOnInit() {
    this.loadBreadcrumb();
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadBreadcrumb());

    this.themeService.currentRole$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((role) => {
        this.currentRole = role;

        if (this.currentRole === 'tenant') {
          this.propertyView = 'my-properties';
          this.getProperties();
        } else {
          this.propertyView = 'all-properties';
          this.getProperties();
        }
      });
  }

  async loadBreadcrumb() {
    this.breadcrumbData = await this.sharedService.getBreadcrumbs([
      { key: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
      { key: 'PAGE_TITLE.PROPERTIES', link: '' },
    ]);

    const lang = localStorage.getItem('language') || 'en';
    this.currentLanguage = lang;
    this.translate.use(lang);
    const direction = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = direction;
  }

  onPropertyViewChange() {
    if (this.propertyView === 'all-properties') {
      delete this.propertiesFilter['property_id'];
      this.propertiesFilter['all'] = true;
      this.getProperties();
    } else if (this.propertyView === 'my-properties') {
      delete this.propertiesFilter['property_id'];
      delete this.propertiesFilter['all'];
      this.getProperties();
    }
  }

  private getProperties() {
    this.propertiesFilter = {
      ...this.propertiesFilter,
      search: this.propertiesFilter['search'] || '',
      limit: this.rowsPerPage,
      page: this.currentPage,
    };

    this.propertyService
      .getProperties(this.propertiesFilter)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.propertiesList = response?.content ?? [];
          this.totalRecords = response?.pagination?.total_records ?? 0;
          if (
            this.propertyView === 'my-properties' ||
            this.propertiesFilter['property_id']
          ) {
            this.handlePropertyDetails();
          }
        },
      });
  }

  onRefresh() {
    this.getProperties();
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

  handlePropertyDetails() {
    const data: any = this.propertiesList[0];
    let basicDetails = {
      name: data?.property_name ?? 'N/A',
      location: data?.address ?? 'N/A',
      status: data?.rental_status ?? 'N/A',
      rent: data?.commercial_info?.rent ?? 'N/A',
      bhk: data?.bedrooms ? `${data?.bedrooms} BHK` : 'N/A',
      sqft: data?.area_of_property
        ? `${data?.area_of_property} ${data?.area_unit}`
        : `N/A`,
    };
    let propertyImages: PropertyImages[] = data?.images?.length
      ? data?.images.map((i: any) => ({ imgSrc: i.data }))
      : Array.from({ length: 5 }).map((_, i) => ({
          imgSrc: 'assets/property/property-img-default.svg',
        }));

    let sections: Section[] = [
      {
        title: 'Property details',
        items: [
          {
            label: 'Phone Number',
            value: data?.owner_info?.contact_number ?? 'N/A',
          },
          { label: 'Property Code', value: data?.property_code ?? 'N/A' },
          { label: 'City', value: data?.address ?? 'N/A' },
          { label: 'Locality', value: data?.address ?? 'N/A' },
          { label: 'Postal Code', value: data?.address ?? 'N/A' },
          { label: 'Address Line 1', value: data?.address ?? 'N/A' },
          { label: 'Address Line 2 ', value: data?.address ?? 'N/A' },
        ],
      },
      {
        title: 'Property Costing',
        items: [
          { label: 'Rent Cost', value: data?.commercial_info?.rent ?? 'N/A' },
        ],
      },
      {
        title: 'Tenant details',
        items: [
          { label: 'Name', value: data?.tenants?.[0]?.tenant_name ?? 'N/A' },
          { label: 'Email', value: data?.tenants?.[0]?.tenant_name ?? 'N/A' },
          {
            label: 'Phone Number',
            value: data?.tenants?.[0]?.contact_number ?? 'N/A',
          },
          {
            label: 'Emirates ID',
            value: data?.tenants?.[0]?.emirate_id ?? 'N/A',
          },
          { label: 'City', value: data?.tenants?.[0]?.country ?? 'N/A' },
          { label: 'Locality', value: data?.tenants?.[0]?.country ?? 'N/A' },
          { label: 'Postal Code', value: data?.tenants?.[0]?.country ?? 'N/A' },
          {
            label: 'Address Line 1',
            value: data?.tenants?.[0]?.country ?? 'N/A',
          },
          {
            label: 'Address Line 2',
            value: data?.tenants?.[0]?.country ?? 'N/A',
          },
        ],
      },
      {
        title: 'Owner details',
        items: [
          { label: 'Name', value: data?.owner_info?.owner_name ?? 'N/A' },
          {
            label: 'Emirates ID',
            value: data?.owner_info?.emirate_id ?? 'N/A',
          },
          {
            label: 'Residence Visa',
            value: data?.owner_info?.uae_residence_visa ?? 'N/A',
          },
          {
            label: 'Trade License',
            value: data?.owner_info?.trade_license ?? 'N/A',
          },
          { label: 'Owner Code', value: data?.owner_info?.owner_code ?? 'N/A' },
        ],
      },
    ];
    this.property = { ...basicDetails, propertyImages, sections };
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

  handleFilterClick(): void {
    console.log('Filter button clicked');
  }

  handleExportClick(): void {
    this.propertyService
      .getExcelFileOfProperty({})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        console.log('response:--->', resp);
        // Create a URL for the blob
        const url = window.URL.createObjectURL(resp);

        // Create a temporary link element
        const a = document.createElement('a');
        a.href = url;
        a.download = 'property_export.csv'; // filename
        a.click();

        // Release memory
        window.URL.revokeObjectURL(url);
      });
  }

  handleEditClick(id: number): void {
    console.log('Edit button clicked');
    this.router.navigate(['/dashboard/edit-property', id]);
  }

  handleDeleteClick(): void {
    console.log('Delete button clicked');
  }

  handleBackClick(): void {
    this.showDetailView = false;
    this.router.navigate(['/dashboard/properties']);
  }

  selectedProperties: any = null;

  handleViewClick(propertyId: number): void {
    this.router.navigate(['/dashboard/property/details/', propertyId]);
  }
}
