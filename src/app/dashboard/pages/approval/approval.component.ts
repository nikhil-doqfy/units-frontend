import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { WhiteCardComponent } from "../../../shared/component/white-card/white-card.component";
import { CardTitleComponent } from "../../../shared/component/card-title/card-title.component";
import { AcceptIconComponent } from "../../component/icons/accept-icon/accept-icon.component";
import { RejectIconComponent } from "../../component/icons/reject-icon/reject-icon.component";
import { TableImgItemComponent } from "../../component/table-img-item/table-img-item.component";
import { TableSelectComponent } from "../../component/table-select/table-select.component";
import { TableActionButtonComponent } from "../../component/table-action-btn/table-action-btn.component";
import { TablePaginationComponent } from "../../../dashboard/component/table-pagination/table-pagination.component";
import { SortingIconComponent } from "../../component/icons/sorting-icon/sorting-icon.component";
import { TableViewCardComponent } from "../../component/table-view-card/table-view-card.component";
import { DocumentTypeItemComponent } from "../../component/document-type-item/document-type-item.component";

@Component({
  selector: 'app-approval',
  standalone: true,
  imports: [CommonModule, WhiteCardComponent, CardTitleComponent, AcceptIconComponent, RejectIconComponent, TableImgItemComponent, TableSelectComponent, TableActionButtonComponent, TablePaginationComponent, SortingIconComponent, TableViewCardComponent, DocumentTypeItemComponent],
  templateUrl: './approval.component.html',
  styleUrl: './approval.component.css'
})
export class ApprovalComponent {
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Approval', link: '' },
  ];

  showDetailView: boolean = false;

  constructor(private router: Router) { }

  handleRejectClick(): void {
    console.log('Reject button clicked');
  }

  handleApproveClick(): void {
    console.log('Approve button clicked');
  }

  handleViewClick(): void {
    this.showDetailView = true;
  }

  handleBackClick(): void {
    this.showDetailView = false;
  }
}