import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { EditIconComponent } from '../../component/icons/edit-icon/edit-icon.component';
import { DeleteIconComponent } from '../../component/icons/delete-icon/delete-icon.component';
import { DocDownloadIconComponent } from '../icons/doc-download-icon/doc-download-icon.component';
import { PreviewIconComponent } from '../icons/preview-icon/preview-icon.component';
import { ViewIconComponent } from '../icons/view-icon/view-icon.component';
import { ApproveIconComponent } from '../../../icon/approve-icon/approve-icon.component';
import { ArrowUpRightComponent } from '../../../icon/arrow-up-right/arrow-up-right.component';
import { RejectIconComponent } from '../icons/reject-icon/reject-icon.component';
import { DisableIconComponent } from '../../../icon/disable-icon/disable-icon.component';
import { FileIconComponent } from '../../../icons/file-icon/file-icon.component';
import { SendAppLinkIconComponent } from '../../../icons/send-app-link-icon/send-app-link-icon.component';
import { HistoryIconComponent } from '../../../icons/history-icon/history-icon.component';
import { TranslateModule } from '@ngx-translate/core';

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
    ViewIconComponent,
    ApproveIconComponent,
    ArrowUpRightComponent,
    RejectIconComponent,
    DisableIconComponent,
    FileIconComponent,
    SendAppLinkIconComponent,
    HistoryIconComponent,
    TranslateModule,
  ],
  templateUrl: './table-action-btn.component.html',
  styleUrls: ['./table-action-btn.component.css'],
})
export class TableActionButtonComponent {
  @Input() type!:
    | 'edit'
    | 'delete'
    | 'download'
    | 'preview'
    | 'up-arrow'
    | 'view'
    | 'complete'
    | 'disable'
    | 'renew'
    | 'file'
    | 'sendLink'
    | 'reject'
    | 'rejectOrange'
    | 'approve'
    | 'restart'
    | 'history';
  @Output() clicked = new EventEmitter<void>();

  getTooltip(type: string): string {
    switch (type) {
      case 'edit':
        return 'Edit';
      case 'delete':
        return 'Delete';
      case 'download':
        return 'Download';
      case 'preview':
        return 'Preview';
      case 'up-arrow':
        return 'up-arrow';
      case 'complete':
        return 'complete';
      case 'disable':
        return 'disable';
      case 'view':
        return 'View';
      case 'renew':
        return '';
      case 'reject':
        return '';
      case 'rejectOrange':
        return '';
      case 'approve':
        return '';
      case 'file':
        return 'File';
      case 'sendLink':
        return 'Send App Link';
      case 'restart':
        return 'Restart';
      case 'history':
        return 'History';
      default:
        return '';
    }
  }

  onClick(): void {
    this.clicked.emit();
  }
}
