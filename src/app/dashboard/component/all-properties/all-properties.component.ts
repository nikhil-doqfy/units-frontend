import { Component, inject, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { TableTitleComponent } from '../table-title/table-title.component';
import { TableSearchComponent } from '../table-search/table-search.component';
import { TableFilterButtonComponent } from '../table-filter-btn/table-filter-btn.component';
import { ExportIconComponent } from '../icons/export-icon/export-icon.component';
import { FilterIconComponent } from '../icons/filter-icon/filter-icon.component';
import { TableSelectComponent } from '../table-select/table-select.component';
import { TablePaginationComponent } from '../table-pagination/table-pagination.component';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { SortingIconComponent } from '../icons/sorting-icon/sorting-icon.component';
import { TableImgItemComponent } from '../table-img-item/table-img-item.component';
import { EditIconComponent } from '../icons/edit-icon/edit-icon.component';
import { TableActionDropdownComponent } from '../table-action-dropdown/table-action-dropdown.component';
import { ResetIconComponent } from '../icons/reset-icon/reset-icon.component';
import { ShareIconComponent } from '../icons/share-icon/share-icon.component';
import { PropertySharePlatfromComponent } from '../../property-share-platfrom/property-share-platfrom.component';
import { FilterPopupButtonComponent } from '../filter-popup-btn/filter-popup-btn.component';
import { CustomSelectComponent } from '../custom-select/custom-select.component';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { debounceTime, Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../../shared.service';
import { SharedApiService } from '../../../shared/services/shared-api.service';

@Component({
  selector: 'app-all-properties',
  standalone: true,
  imports: [
    TranslateModule,
    CommonModule,
    TableTitleComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    ExportIconComponent,
    FilterIconComponent,
    TableSelectComponent,
    TablePaginationComponent,
    SortingIconComponent,
    TableImgItemComponent,
    EditIconComponent,
    TableActionDropdownComponent,
    PropertySharePlatfromComponent,
    FilterPopupButtonComponent,
    CustomSelectComponent,
    NoDataComponent,
    FormsModule,
  ],
  templateUrl: './all-properties.component.html',
  styleUrl: './all-properties.component.css',
})
export class AllPropertiesComponent implements OnInit {
  private propertyService = inject(PropertyService);
  private sharedApiService = inject(SharedApiService);
  selectedPropertyType: any = null;
  selectedStatus: any = null;
  selectedPMC: any = null;
  showDetailView: boolean = false;
  properties: any[] = [];
  totalRecords: number = 0;
  componentName: string = 'all-properties-component';
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;
  searchText: string = '';

  private search$ = new Subject<string>();

  filterPropertyType: string | null = null;
  filterStatus: string | null = null;
  filterPMC: string | null = null;

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

  statusOptions = [
    { key: 'PUBLIC', value: 'Public' },
    { key: 'DRAFT', value: 'Draft' },
  ];

  // Loaded from API: GET /options?option_type=PMC_BY_PM
  pmcOptions: any[] = [];

  documentActions = [
    { label: 'Share', icon: ShareIconComponent, action: 'share' },
    { label: 'Reset', icon: ResetIconComponent, action: 'reset' },
  ];

  constructor(
    private router: Router,
    private sharedService: SharedService,
  ) {}

  ngOnInit(): void {
    this.search$.pipe(debounceTime(400)).subscribe((text) => {
      this.searchText = text;
      this.currentPage = 1;
      this.loadProperties();
    });
    this.loadProperties();
    this.loadPmcOptions();
  }

  loadPmcOptions(): void {
    this.sharedApiService
      .getOptions({ option_type: 'PMC_BY_PM' })
      .subscribe((resp: any) => {
        this.pmcOptions = resp?.content?.pmc ?? [];
      });
  }

  buildParams(): Record<string, any> {
    const params: Record<string, any> = {
      page: this.currentPage,
      page_size: this.rowsPerPage,
    };
    if (this.searchText) params['search'] = this.searchText;
    if (this.filterPropertyType)
      params['property_type'] = this.filterPropertyType;
    if (this.filterStatus) params['status'] = this.filterStatus;
    if (this.filterPMC) params['pmc_id'] = this.filterPMC;
    return params;
  }

  loadProperties(): void {
    this.propertyService.getProperties(this.buildParams()).subscribe({
      next: (resp: any) => {
        this.properties = resp?.content || [];
        this.totalRecords =
          resp?.pagination?.total_records ?? this.properties.length;
      },
    });
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
  onRefresh() {
    this.loadProperties();
  }

  onPropertyTypeSelect(option: any) {
    this.selectedPropertyType = option;
    this.filterPropertyType = option?.key;
  }

  onStatusSelect(option: any) {
    this.selectedStatus = option;
    this.filterStatus = option?.key;
  }
  searchTextChange(text: string): void {
    this.search$.next(text);
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.loadProperties();
  }

  removeFilter(): void {
    this.filterPropertyType = null;
    this.filterStatus = null;
    this.filterPMC = null;
    this.selectedPropertyType = null;
    this.selectedStatus = null;
    this.selectedPMC = null;
    this.currentPage = 1;
    this.loadProperties();
  }

  handleExport(): void {
    this.propertyService.exportProperties(this.buildParams());
  }

  handleDropdownAction(action: string) {
    console.log(`${action} action clicked`);
  }

  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.loadProperties();
  }

  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.loadProperties();
  }

  onViewClick(id: number) {
    this.router.navigate(['/dashboard/properties', id]);
  }

  onEditClick(id: number) {
    this.router.navigate(['/dashboard/edit-property', id]);
  }
  sortField: string = '';

  sortOrder: 'asc' | 'desc' = 'asc';

  sort(field: string) {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;

      this.sortOrder = 'asc';
    }

    this.properties = this.sharedService.sortData(
      this.properties,

      field,

      this.sortOrder,
    );
  }
}
