import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { PlusIconComponent } from '../../../shared/component/icons/plus-icon/plus-icon.component';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { InviteOwnerBtnComponent } from '../../component/invite-owner-btn/invite-owner-btn.component';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TablePaginationComponent } from '../../component/table-pagination/table-pagination.component';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { CircularCrossBtnIconComponent } from '../../../icons/circular-cross-btn-icon/circular-cross-btn-icon.component';
import { PreviewIconComponent } from '../../component/icons/preview-icon/preview-icon.component';
import { DeleteIconComponent } from '../../component/icons/delete-icon/delete-icon.component';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [
    TranslateModule,
    WhiteCardComponent,
    PlusIconComponent,
    TableTitleComponent,
    ExportIconComponent,
    CommonModule,
    TableFilterButtonComponent,
    TableSearchComponent,
    TableImgItemComponent,
    TableSelectComponent,
    TablePaginationComponent,
    SortingIconComponent,
    CircularCrossBtnIconComponent,
    PreviewIconComponent,
    DeleteIconComponent,
  ],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.css',
})
export class AnnouncementsComponent {
  componentName: string = 'AnnouncementsComponent';
  totalRecords: number = 0;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;
  prop: 'logs' | 'sent' | 'scheduled' | 'draft' | 'deleted' | null = 'logs';

  changeTab(type: any) {
    this.prop = type;
  }
  onRefresh() {}
  private onAnnouncementSearch$ = new Subject<string>();
  searchTextChange(search: string) {
    this.onAnnouncementSearch$.next(search);
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
  showCreateScreen: boolean = false;

  openCreate() {
    this.showCreateScreen = true;
  }

  closeCreate() {
    this.showCreateScreen = false;
  }
}
