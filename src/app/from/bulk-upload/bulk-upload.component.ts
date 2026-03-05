import { Component } from '@angular/core';
import { UploadDocumentComponent } from '../../dashboard/component/upload-document/upload-document.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { UploadFileModel } from '../../shared/model/shared.model';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [UploadDocumentComponent, TranslateModule, CommonModule],
  templateUrl: './bulk-upload.component.html',
  styleUrl: './bulk-upload.component.css',
})
export class BulkUploadComponent {
  uploadedFile?: UploadFileModel;
  sampleCsvDownload() {
    console.log('Download sample CSV');
  }
  onBulkUpload(event: UploadFileModel) {
    if (event.status === 'done') {
      this.uploadedFile = event;
    }
  }
}
