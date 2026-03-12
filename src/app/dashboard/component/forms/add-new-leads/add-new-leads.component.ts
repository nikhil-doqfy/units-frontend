import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CustomSelectComponent } from '../../custom-select/custom-select.component';
import { UploadFileModel } from '../../../../shared/model/shared.model';
import { UploadDocumentComponent } from '../../upload-document/upload-document.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedApiService } from '../../../../shared/services/shared-api.service';

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
export class AddNewLeadsComponent implements OnInit {
  @Input() editData: any = null;
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() tabChanged = new EventEmitter<'manual' | 'bulk'>();

  private sharedApiService = inject(SharedApiService);

  unitOptions: { key: number; value: string }[] = [];
  selectedUnit: { key: number; value: string } | null = null;

  uploadedFile?: UploadFileModel;
  submitForm() {}
  activeTab: 'manual' | 'bulk' = 'manual';

  ngOnInit() {
    this.sharedApiService.getOptionsType([
      {
        param: 'PROPERTY_UNIT',
        key: 'property_unit',
        setter: (v) => (this.unitOptions = v),
      },
    ]);
  }

  onUnitSelect(unit: any) {
    this.selectedUnit = unit;
  }

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
