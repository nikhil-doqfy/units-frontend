import { Component, EventEmitter, inject, Output } from '@angular/core';
import { UploadDocumentComponent } from '../dashboard/component/upload-document/upload-document.component';
import { DocumenattionService } from '../service/documenattion.service';
import { FileUploadItemComponent } from '../dashboard/component/file-upload-item/file-upload-item.component';
import { UploadFileModel } from '../shared/model/shared.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tenant-document-upload',
  standalone: true,
  imports: [UploadDocumentComponent, FileUploadItemComponent, CommonModule],
  templateUrl: './tenant-document-upload.component.html',
  styleUrl: './tenant-document-upload.component.css',
})
export class TenantDocumentUploadComponent {
  private documenattionService = inject(DocumenattionService);
  uploadedFile: any = null;
  uploadError: string = '';
  uploadedFiles: UploadFileModel[] = [];

  @Output() documentUploaded = new EventEmitter<any>();

  uploadDocument(): void {
    if (!this.uploadedFile) {
      this.uploadError = 'Please upload a document.';
      return;
    }
    const file = this.uploadedFiles[0];
    const payload = {
      documents: [
        {
          file_name: this.uploadedFile.file.name,
          file_data:
            this.uploadedFile.base64?.split(',')[1] ?? this.uploadedFile.base64,
        },
      ],
    };

    this.documenattionService.uploadTenantDocument(payload).subscribe({
      next: (resp: any) => {
        this.documentUploaded.emit(resp);
      },
      error: () => {
        this.uploadError = 'Unable to upload document.';
      },
    });
  }
  onDocumentUpload(event: UploadFileModel): void {
    this.uploadedFile = event;
    const index = this.uploadedFiles.findIndex(
      (item) => item.tempId === event.tempId,
    );

    if (index > -1) {
      this.uploadedFiles[index] = event;
    } else {
      this.uploadedFiles.push(event);
    }

    this.uploadError = '';
  }
  removeFile(file: UploadFileModel): void {
    this.uploadedFiles = this.uploadedFiles.filter(
      (item) => item.tempId !== file.tempId,
    );
    this.uploadedFile = null;
  }
}
