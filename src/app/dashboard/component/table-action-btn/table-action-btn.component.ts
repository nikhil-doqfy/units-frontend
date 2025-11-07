import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { EditIconComponent } from '../../component/icons/edit-icon/edit-icon.component';
import { DeleteIconComponent } from '../../component/icons/delete-icon/delete-icon.component';
import { DocDownloadIconComponent } from '../icons/doc-download-icon/doc-download-icon.component';
import { PreviewIconComponent } from '../icons/preview-icon/preview-icon.component';
import { ViewIconComponent } from "../icons/view-icon/view-icon.component";

@Component({
  selector: 'app-table-action-btn',
  standalone: true,
  imports: [
    CommonModule,
    NgbTooltipModule,
    EditIconComponent,
    DeleteIconComponent,
    DocDownloadIconComponent,
    PreviewIconComponent,
    ViewIconComponent
  ],
  templateUrl: './table-action-btn.component.html',
  styleUrls: ['./table-action-btn.component.css']
})
export class TableActionButtonComponent {

  @Input() type!: 'edit' | 'delete' | 'download' | 'preview' | 'view' | 'renew' | 'reject' | 'rejectOrange' | 'approve';
  @Output() clicked = new EventEmitter<void>();

  getTooltip(type: string): string {
    switch (type) {
      case 'edit': return 'Edit';
      case 'delete': return 'Delete';
      case 'download': return 'Download';
      case 'preview': return 'Preview';
      case 'view': return 'View';
      case 'renew': return '';
      case 'reject': return '';
      case 'rejectOrange': return '';
      case 'approve': return '';
      default: return '';
    }
  }

  onClick(): void {
    this.clicked.emit();
  }
}