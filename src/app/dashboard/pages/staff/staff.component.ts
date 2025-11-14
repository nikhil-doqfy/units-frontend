import { Component, inject, signal, TemplateRef, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { TableTitleComponent } from "../../../dashboard/component/table-title/table-title.component";
import { TableImgItemComponent } from "../../component/table-img-item/table-img-item.component";
import { TableMultiImgItemComponent } from "../../component/table-multi-img-item/table-multi-img-itemcomponent";
import { TableSelectComponent } from "../../component/table-select/table-select.component";
import { TableSearchComponent } from "../../component/table-search/table-search.component";
import { TableFilterButtonComponent } from "../../../dashboard/component/table-filter-btn/table-filter-btn.component";
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { ExportIconComponent } from "../../component/icons/export-icon/export-icon.component";
import { PlusIconComponent } from "../../../shared/component/icons/plus-icon/plus-icon.component";
import { TableActionButtonComponent } from "../../component/table-action-btn/table-action-btn.component";
import { TableActionDropdownComponent } from '../../component/table-action-dropdown/table-action-dropdown.component';
import { ShareIconComponent } from '../../component/icons/share-icon/share-icon.component';
import { ResetIconComponent } from '../../component/icons/reset-icon/reset-icon.component';
import { TablePaginationComponent } from "../../../dashboard/component/table-pagination/table-pagination.component";
import { SortingIconComponent } from "../../component/icons/sorting-icon/sorting-icon.component";
import { AddStaffFormComponent } from "../../component/forms/add-staff-form/add-staff-form.component";
import { TableViewCardComponent } from "../../component/table-view-card/table-view-card.component";

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, TableTitleComponent, TableImgItemComponent, TableMultiImgItemComponent, TableSelectComponent, TableSearchComponent, TableFilterButtonComponent, FilterIconComponent, ExportIconComponent, PlusIconComponent, TableActionButtonComponent, TableActionDropdownComponent, TablePaginationComponent, SortingIconComponent, AddStaffFormComponent, TableViewCardComponent],
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.css'
})
export class StaffComponent {
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Staff', link: '' },
  ];

  private modalService = inject(NgbModal);
  closeResult: WritableSignal<string> = signal('');

  showDetailView: boolean = false;

  documentActions = [
    { label: 'Share', icon: ShareIconComponent, action: 'share' },
    { label: 'Reset', icon: ResetIconComponent, action: 'reset' }
  ];

  constructor(private router: Router) { }

  handleDropdownAction(action: string) {
    console.log(`${action} action clicked`);
  }

  handleFilterClick(): void {
    console.log('Filter button clicked');
  }

  handleExportClick(): void {
    console.log('Export button clicked');
  }

  openAddStaffModal(addStaffContent: TemplateRef<any>) {
    this.modalService.open(addStaffContent, { ariaLabelledBy: 'modal-title', windowClass: 'mdlCommon', centered: true }).result.then(
      (result) => {
        this.closeResult.set(`Closed with: ${result}`);
      },
      (reason) => {
        this.closeResult.set(`Dismissed ${this.getDismissReason(reason)}`);
      },
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

  handleEditClick(): void {
    console.log('Edit button clicked');
  }

  handleDeleteClick(): void {
    console.log('Delete button clicked');
  }

  handleViewClick(): void {
    this.showDetailView = true;
  }

  handleBackClick(): void {
    this.showDetailView = false;
  }

  handleDownloadDocumentClick(): void {
    console.log('Download Document button clicked');
  }

  handlePreviewDocumentClick(): void {
    console.log('Preview Document button clicked');
  }
}