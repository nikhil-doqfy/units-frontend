import { Component } from '@angular/core';
import { TablePaginationComponent } from '../table-pagination/table-pagination.component';
import { TableSelectComponent } from '../table-select/table-select.component';
import { TableActionButtonComponent } from '../table-action-btn/table-action-btn.component';
import { TableImgItemComponent } from '../table-img-item/table-img-item.component';
import { ExportIconComponent } from '../icons/export-icon/export-icon.component';
import { TableFilterButtonComponent } from '../table-filter-btn/table-filter-btn.component';
import { TableSearchComponent } from '../table-search/table-search.component';
import { TableTitleComponent } from '../table-title/table-title.component';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { Subject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { PlatfromBadgeComponent } from '../platfrom-badge/platfrom-badge.component';
import { AudioPlayerComponent } from '../../../shared/audio-player/audio-player.component';

@Component({
  selector: 'app-call-leads',
  standalone: true,
  imports: [
    TablePaginationComponent,
    TableSelectComponent,
    TableActionButtonComponent,
    TableImgItemComponent,
    ExportIconComponent,
    TableFilterButtonComponent,
    TableSearchComponent,
    TableTitleComponent,
    TranslateModule,
    CommonModule,
    PlatfromBadgeComponent,
    AudioPlayerComponent,
  ],
  templateUrl: './call-leads.component.html',
  styleUrl: './call-leads.component.css',
})
export class CallLeadsComponent {
  private onLeadsSearch$ = new Subject<string>();

  totalRecords: number = 0;
  rowsPerPage: number = 10;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  currentPage: number = 1;
  showDetailView: boolean = false;

  componentName = 'allLeadsComponent';
  call: any;
  onRefresh() {}
  searchTextChange(search: string): void {
    this.onLeadsSearch$.next(search);
  }
  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
  }
  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
  }
  handleExportClick() {}
}
