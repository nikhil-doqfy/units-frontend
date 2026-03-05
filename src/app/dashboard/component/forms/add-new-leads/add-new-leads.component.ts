import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CustomSelectComponent } from '../../custom-select/custom-select.component';
import { UploadFileModel } from '../../../../shared/model/shared.model';
import { UploadDocumentComponent } from '../../upload-document/upload-document.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-new-leads',
  standalone: true,
  imports: [
    CommonModule,
    CustomSelectComponent,
    UploadDocumentComponent,
    TranslateModule,
  ],
  templateUrl: './add-new-leads.component.html',
  styleUrl: './add-new-leads.component.css',
})
export class AddNewLeadsComponent {
  @Input() editData: any = null;
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() tabChanged = new EventEmitter<'manual' | 'bulk'>();

  uploadedFile?: UploadFileModel;
  submitForm() {}
  activeTab: 'manual' | 'bulk' = 'manual';

  sampleCsvDownload() {
    console.log('Download sample CSV');
  }

  setTab(tab: 'manual' | 'bulk') {
    this.activeTab = tab;
    this.tabChanged.emit(tab);
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    console.log('Uploaded file:', file);
  }

  uploadFile() {
    console.log('Upload clicked');
  }

  onBulkUpload(event: UploadFileModel) {
    if (event.status === 'done') {
      this.uploadedFile = event;
    }
  }

  uploadBulkFile() {}
}
