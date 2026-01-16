import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
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
import { TranslateModule } from '@ngx-translate/core';
import { PropertyService } from '../../services/property.service';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { NoDataComponent } from '../../../no-data/no-data.component';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [
    RouterModule,
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
    RouterLink,
  ],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.css',
})
export class PropertiesComponent {
  private propertyService = inject(PropertyService);

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
  onPropertySearch$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private router: Router, private themeService: ThemeService) {
    this.onPropertySearch$
      .pipe(debounceTime(1500), takeUntil(this.destroy$))
      .subscribe((value) => {
        if (value?.trim()) this.propertiesFilter['search'] = value.trim();
        else delete this.propertiesFilter['search'];

        this.getProperties();
      });
  }

  ngOnInit() {
    this.themeService.currentRole$
      .pipe(takeUntil(this.destroy$))
      .subscribe((role) => {
        this.currentRole = role;

        if (this.currentRole === 'tenant') {
          this.propertyView = 'my-properties';
        } else {
          this.propertyView = 'all-properties';
          this.getProperties();
        }
      });
  }

  onPropertyViewChange() {
    if (this.propertyView === 'all-properties') {
      this.getProperties();
    } else if (this.propertyView === 'my-properties') {
    }
  }

  private getProperties() {
    this.propertiesFilter = {
      ...this.propertiesFilter,
      limit: this.rowsPerPage,
      page: this.currentPage,
    };

    this.propertyService
      .getProperties(this.propertiesFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.propertiesList = response?.content ?? [];
          this.totalRecords = response?.pagination?.total_records ?? 0;
        },
      });
  }

  onRefresh() {
    this.getProperties();
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

  property = {
    name: 'Premium Villa',
    location: 'Bengaluru, Koramangala',
    status: 'Available',
    rent: '₹ 45,000 / month',
    bhk: '2 BHK',
    sqft: '1200 Sqft',
    propertyImages: [
      {
        imgSrc: 'assets/property/property-img-1.png',
      },
      {
        imgSrc: 'assets/property/property-img-2.png',
      },
      {
        imgSrc: 'assets/property/property-img-3.png',
      },
      {
        imgSrc: 'assets/property/property-img-4.png',
      },
      {
        imgSrc: 'assets/property/property-img-5.png',
      },
    ],
    sections: [
      {
        title: 'Property details',
        items: [
          { label: 'Phone Number', value: '+91-7007836367' },
          { label: 'Property Code', value: 'owner@villa.com' },
          { label: 'City', value: 'Bengaluru' },
          { label: 'Locality', value: '--' },
          { label: 'Postal Code', value: '5621009' },
          { label: 'Address Line 1', value: 'Koramangala' },
          { label: 'Address Line 2 ', value: 'Bellandur' },
        ],
      },
      {
        title: 'Property Costing',
        items: [{ label: 'Rent Cost', value: 'AED31,224' }],
      },
      {
        title: 'Tenant details',
        items: [
          { label: 'Name', value: 'Richard' },
          { label: 'Email', value: 'Richard@gmail.com' },
          { label: 'Phone Number', value: '+97-7007836367' },
          { label: 'Emirates ID', value: 'Afc25' },
          { label: 'City', value: 'Bengaluru' },
          { label: 'Locality', value: '--' },
          { label: 'Postal Code', value: '5621009' },
          { label: 'Address Line 1', value: 'Koramangala' },
          { label: 'Address Line 2', value: 'Bellandur' },
        ],
      },
      {
        title: 'Owner details',
        items: [
          { label: 'Name', value: 'Ali Musfiq Rahman' },
          { label: 'Emirates ID', value: '784198657395715' },
          { label: 'Residence Visa', value: '20120247736538' },
          { label: 'Trade License', value: '247334' },
          { label: 'Owner Code', value: '5621009' },
        ],
      },
    ],
  };

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
    console.log('Export button clicked');
  }

  handleEditClick(): void {
    console.log('Edit button clicked');
  }

  handleDeleteClick(): void {
    console.log('Delete button clicked');
  }

  handleViewClick(): void {
    this.showDetailView = true;
  }

  handleBackClick(): void {
    this.showDetailView = false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
