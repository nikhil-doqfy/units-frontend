import { Component, EventEmitter, Output } from '@angular/core';
import { UploadDocumentComponent } from '../dashboard/component/upload-document/upload-document.component';

@Component({
  selector: 'app-tenant-document-upload',
  standalone: true,
  imports: [UploadDocumentComponent],
  templateUrl: './tenant-document-upload.component.html',
  styleUrl: './tenant-document-upload.component.css',
})
export class TenantDocumentUploadComponent {
  uploadedFile: any = null;
  uploadError: string = '';

  onDocumentUpload(event: any): void {
    this.uploadedFile = event;
    this.uploadError = '';
  }
  @Output() documentUploaded = new EventEmitter<any>();

  uploadDocument(): void {
    // Upload API call

    this.documentUploaded.emit(this.uploadedFile);
  }
}
