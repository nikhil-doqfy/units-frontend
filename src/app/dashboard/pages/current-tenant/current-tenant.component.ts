import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TablePaginationComponent} from '../../component/table-pagination/table-pagination.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { CustomSelectComponent } from '../../../auth/component/custom-select/custom-select.component';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { TenantDetailComponent } from '../tenant-detail/tenant-detail.component';

@Component({
  selector: 'app-current-tenant',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TablePaginationComponent,
    TableSelectComponent,
    TableImgItemComponent,
    TableTitleComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    ExportIconComponent,
    SortingIconComponent,
    CustomSelectComponent,
    TenantDetailComponent,
  ],
  templateUrl: './current-tenant.component.html',
  styleUrl: './current-tenant.component.css',
})
export class CurrentTenantComponent {
  @Output() detailViewChanges = new EventEmitter<boolean>();

  totalRecords       = 0;
  rowsPerPage        = 10;
  rowsPerPageOptions = [10, 25, 50, 100];
  currentPage        = 1;
  componentName      = 'CurrentTenantComponent';

  showDetailView = false;
  selectedLease: any = null;

  constructor() {}

  onLeaseClick(lease: any) {
    this.selectedLease  = lease;
    this.showDetailView = true;
    this.detailViewChanges.emit(true);
  }

  onDetailBack() {
    this.showDetailView = false;
    this.selectedLease  = null;
    this.detailViewChanges.emit(false);
  }

  onDetailClose() {
    this.showDetailView = false;
    this.selectedLease  = null;
    this.detailViewChanges.emit(false);
  }

  onPageChange(event: PageChange) {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
  }

  onPageSizeChange(event: PageSizeChange) {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
  }

  onRefresh() {}
}
