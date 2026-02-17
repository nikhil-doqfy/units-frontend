import { Component } from '@angular/core';
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
  ],
  templateUrl: './units.component.html',
  styleUrl: './units.component.css',
})
export class UnitsComponent {
  totalRecords: number = 0;
  showDetailView: boolean = false;
  onRefresh() {}
  documentActions = [
    { label: 'Share', icon: ShareIconComponent, action: 'share' },
    { label: 'Reset', icon: ResetIconComponent, action: 'reset' },
  ];
  handleDropdownAction(action: string) {
    console.log(`${action} action clicked`);
  }
  componentName: string = 'all-properties-component';
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;
  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
  }
  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
  }
}
