import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
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
import { Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { FilterPopupButtonComponent } from '../../component/filter-popup-btn/filter-popup-btn.component';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { debounceTime, Subject } from 'rxjs';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { FormsModule } from '@angular/forms';

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
    FilterPopupButtonComponent,
    CustomSelectComponent,
    NoDataComponent,
    FormsModule,
  ],
  templateUrl: './units.component.html',
  styleUrl: './units.component.css',
})
export class UnitsComponent implements OnInit {
  private propertyService = inject(PropertyService);

  units: any[] = [];
  totalRecords: number = 0;
  componentName: string = 'all-units-component';
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;
  searchText: string = '';
  private search$ = new Subject<string>();

  // Filter values
  filterPropertyId: string = '';
  filterBedrooms: string = '';
  filterFloor: string = '';
  filterAreaUnit: string = '';
  selectedProperty: any = null;
  selectedBedroom: any = null;
  selectedFloor: any = null;
  selectedAreaUnit: any = null;

  // Filter options
  propertyOptions: { key: string; value: string }[] = [];
  bedroomOptions = Array.from({ length: 10 }, (_, i) => ({
    key: String(i + 1),
    value: String(i + 1),
  }));
  floorOptions = Array.from({ length: 51 }, (_, i) => ({
    key: String(i),
    value: String(i),
  }));
  areaUnitOptions = [
    { key: 'SQ_FT', value: 'Sq-ft' },
    { key: 'SQ_MT', value: 'Sq-mt' },
    { key: 'SQ_YD', value: 'Sq-yd' },
  ];

  documentActions = [
    { label: 'Share', icon: ShareIconComponent, action: 'share' },
    { label: 'Reset', icon: ResetIconComponent, action: 'reset' },
  ];

  @Output() detailViewChanges = new EventEmitter<boolean>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.search$.pipe(debounceTime(400)).subscribe((text) => {
      this.searchText = text;
      this.currentPage = 1;
      this.loadUnits();
    });
    this.loadPropertyOptions();
    this.loadUnits();
  }

  loadPropertyOptions(): void {
    this.propertyService.getProperties({ page: 1, page_size: 200 }).subscribe({
      next: (resp: any) => {
        this.propertyOptions = (resp?.content || []).map((p: any) => ({
          key: String(p.id),
          value: p.property_name,
        }));
      },
    });
  }

  buildParams(): Record<string, any> {
    const params: Record<string, any> = {
      page: this.currentPage,
      page_size: this.rowsPerPage,
    };
    if (this.searchText) params['search'] = this.searchText;
    if (this.filterPropertyId) params['property_id'] = this.filterPropertyId;
    if (this.filterBedrooms) params['no_of_bedrooms'] = this.filterBedrooms;
    if (this.filterFloor) params['floor_no'] = this.filterFloor;
    if (this.filterAreaUnit) params['land_area_unit'] = this.filterAreaUnit;
    return params;
  }

  loadUnits(): void {
    this.propertyService.getUnits(this.buildParams()).subscribe({
      next: (resp: any) => {
        this.units = resp?.content || [];
        this.totalRecords =
          resp?.pagination?.total_records ?? this.units.length;
      },
    });
  }

  onRefresh() {
    this.loadUnits();
  }

  searchTextChange(text: string): void {
    this.search$.next(text);
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.loadUnits();
    // this.selectedProperty = null;
    // this.selectedBedroom = null;
    // this.selectedFloor = null;
    // this.selectedAreaUnit = null;
  }

  removeFilter(): void {
    this.filterPropertyId = '';
    this.filterBedrooms = '';
    this.filterFloor = '';
    this.filterAreaUnit = '';
    // this.selectedProperty = null;
    // this.selectedBedroom = null;
    // this.selectedFloor = null;
    // this.selectedAreaUnit = null;
    this.currentPage = 1;
    this.loadUnits();
  }

  handleExport(): void {
    this.propertyService.exportUnits(this.buildParams());
  }

  handleDropdownAction(action: string) {
    console.log(`${action} action clicked`);
  }

  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.loadUnits();
  }

  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.loadUnits();
  }

  onEditClick(id: number) {
    this.router.navigate(['/dashboard/new-units', id]);
  }

  onViewClick(id: number) {
    this.router.navigate(['/dashboard/units', id]);
  }
  clearProperty() {
    this.selectedProperty = null;
    this.filterPropertyId = '';
    this.loadUnits();
  }

  clearBedroom() {
    this.selectedBedroom = null;
    this.filterBedrooms = '';
    this.loadUnits();
  }

  clearFloor() {
    this.selectedFloor = null;
    this.filterFloor = '';
    this.loadUnits();
  }

  clearAreaUnit() {
    this.selectedAreaUnit = null;
    this.filterAreaUnit = '';
    this.loadUnits();
  }
}
