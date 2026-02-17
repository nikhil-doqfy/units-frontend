import { Component } from '@angular/core';
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
}
