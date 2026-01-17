import {
  Component,
  inject,
  Input,
  signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { TableSelectComponent } from '../table-select/table-select.component';
import { TablePaginationComponent } from '../table-pagination/table-pagination.component';
import { TableTitleComponent } from '../table-title/table-title.component';
import { TableSearchComponent } from '../table-search/table-search.component';
import { TableFilterButtonComponent } from '../table-filter-btn/table-filter-btn.component';
import { ExportIconComponent } from '../icons/export-icon/export-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { CommonModule } from '@angular/common';
import { FilterPopupButtonComponent } from '../filter-popup-btn/filter-popup-btn.component';
import { FilterIconComponent } from '../icons/filter-icon/filter-icon.component';
import { TableActionButtonComponent } from '../table-action-btn/table-action-btn.component';
import { TableImgItemComponent } from '../table-img-item/table-img-item.component';
import { BadgeComponent } from '../badge/badge.component';
import { PlatfromBadgeComponent } from '../platfrom-badge/platfrom-badge.component';
import {
  ModalDismissReasons,
  NgbActiveModal,
  NgbDatepickerModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { EditLeadsFormComponent } from '../forms/edit-leads-form/edit-leads-form.component';
import { ActivityHistoryFormComponent } from '../forms/activity-history-form/activity-history-form.component';
import { ActivityHistroyIconsComponent } from '../../../icons/activity-histroy-icons/activity-histroy-icons.component';
import { DateIconComponent } from '../icons/date-icon/date-icon.component';

@Component({
  selector: 'app-all-leads',
  standalone: true,
  imports: [
    TableSelectComponent,
    TablePaginationComponent,
    TableTitleComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    ExportIconComponent,
    TranslateModule,
    CommonModule,
    FilterPopupButtonComponent,
    FilterIconComponent,
    TableImgItemComponent,
    BadgeComponent,
    TableActionButtonComponent,
    PlatfromBadgeComponent,
    EditLeadsFormComponent,
    EditLeadsFormComponent,
    ActivityHistoryFormComponent,
    ActivityHistroyIconsComponent,
    DateIconComponent,
    NgbDatepickerModule,
  ],
  templateUrl: './all-leads.component.html',
  styleUrl: './all-leads.component.css',
})
export class AllLeadsComponent {
  private onLeadsSearch$ = new Subject<string>();
  private modalService = inject(NgbModal);
  closeResult: WritableSignal<string> = signal('');
  totalRecords: number = 0;
  rowsPerPage: number = 10;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  currentPage: number = 1;
  selectedLead: any = null;
  showDetailView: boolean = false;

  componentName = 'allLeadsComponent';

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
  isEditMode: boolean = false;

  openEditLeadModal(
    editLeadContent: TemplateRef<any>,
    editMode: boolean = false
  ) {
    this.isEditMode = editMode;
    this.modalService
      .open(editLeadContent, {
        ariaLabelledBy: 'modal-title',
        windowClass: 'mdlCommon',
        centered: true,
      })
      .result.then(
        (result) => {
          this.closeResult.set(`Closed with: ${result}`);
        },
        (reason) => {
          this.closeResult.set(`Dismissed ${this.getDismissReason(reason)}`);
        }
      );
  }

  openActivityHistroyModal(
    activityHistroyContent: TemplateRef<any>,
    editMode: boolean = false
  ) {
    this.isEditMode = editMode;
    this.modalService
      .open(activityHistroyContent, {
        ariaLabelledBy: 'modal-title',
        windowClass: 'mdlCommon',
        centered: true,
      })
      .result.then(
        (result) => {
          this.closeResult.set(`Closed with: ${result}`);
        },
        (reason) => {
          this.closeResult.set(`Dismissed ${this.getDismissReason(reason)}`);
        }
      );
  }
  private getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.ESC:
        return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK:
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }
  onUserSave(success: boolean, modal: NgbActiveModal) {
    // component.submitUserForm();

    if (success) {
      modal.close();
    }
  }
}
