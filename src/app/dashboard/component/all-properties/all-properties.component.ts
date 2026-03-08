import { Component } from '@angular/core';
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
import { Router } from '@angular/router';

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
  ],
  templateUrl: './all-properties.component.html',
  styleUrl: './all-properties.component.css',
})
export class AllPropertiesComponent {
  showDetailView: boolean = false;
  totalRecords: number = 0;
  componentName: string = 'all-properties-component';
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;
  constructor(private router: Router) {}
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
  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
  }
  onEditClick() {
    this.router.navigate(['/dashboard/add-property']);
  }
}
