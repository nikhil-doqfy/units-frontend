import { Component } from '@angular/core';
import { TablePaginationComponent } from '../../component/table-pagination/table-pagination.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TableActionDropdownComponent } from '../../component/table-action-dropdown/table-action-dropdown.component';
import { BadgeComponent } from '../../component/badge/badge.component';
import { PlatfromBadgeComponent } from '../../component/platfrom-badge/platfrom-badge.component';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { ShareIconComponent } from '../../component/icons/share-icon/share-icon.component';
import { ResetIconComponent } from '../../component/icons/reset-icon/reset-icon.component';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';

@Component({
  selector: 'app-current-tenant',
  standalone: true,
  imports: [
    TablePaginationComponent,
    TableSelectComponent,
    TableActionDropdownComponent,
    BadgeComponent,
    PlatfromBadgeComponent,
    TableImgItemComponent,
    TableTitleComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    ExportIconComponent,
    TranslateModule,
    SortingIconComponent,
  ],
  templateUrl: './current-tenant.component.html',
  styleUrl: './current-tenant.component.css',
})
export class CurrentTenantComponent {
  totalRecords: number = 0;
  rowsPerPage: number = 10;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  currentPage: number = 1;
  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
  }
  componentName: string = 'TenantsComponent';
  onRefresh() {}
  documentActions = [
    { label: 'Share', icon: ShareIconComponent, action: 'share' },
    { label: 'Reset', icon: ResetIconComponent, action: 'reset' },
  ];
  handleDropdownAction(action: string) {
    console.log(`${action} action clicked`);
  }
  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
  }
}
