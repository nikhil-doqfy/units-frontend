import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { UploadDocumentComponent } from '../dashboard/component/upload-document/upload-document.component';
import { DocumenattionService } from '../service/documenattion.service';
import { FileUploadItemComponent } from '../dashboard/component/file-upload-item/file-upload-item.component';
import { UploadFileModel } from '../shared/model/shared.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LeaseService } from '../dashboard/services/lease.service';

@Component({
  selector: 'app-tenant-document-upload',
  standalone: true,
  imports: [
    UploadDocumentComponent,
    FileUploadItemComponent,
    CommonModule,
    FormsModule,
    TranslateModule,
  ],
  templateUrl: './tenant-document-upload.component.html',
  styleUrl: './tenant-document-upload.component.css',
})
export class TenantDocumentUploadComponent implements OnChanges, OnInit {
  private documenattionService = inject(DocumenattionService);
  private leaseService = inject(LeaseService);

  @ViewChild('uploadTenantDocumentModal')
  uploadTenantDocumentModal!: TemplateRef<any>;

  documentTypeOptions: { label: string; value: string }[] = [];

  documentTitle: string = '';
  documentStatus: string = '';
  neverExpire: boolean = false;
  expiryDate: string = '';
  expiryDays: number | null = null;
  daysUntilExpiry: number | null = null;
  daysLabel: string = '';
  daysPillClass: string = '';

  // Validation errors
  titleError: string = '';
  statusError: string = '';
  expiryError: string = '';

  // File state
  uploadedFile: any = null;
  uploadError: string = '';
  uploadedFiles: UploadFileModel[] = [];

  @Output() documentUploaded = new EventEmitter<any>();
  @Input() document: any = null;
  @Input() isEditMode = false;
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['document'] && this.document) {
      const doc = this.document;
      const normalized = {
        ...doc,
        never_expire: doc.never_expire ?? doc.does_not_expire ?? false,
        file_name: doc.file_name ?? doc.title ?? '',
      };
      this.setDocument(normalized);
    }
  }

  ngOnInit(): void {
    this.loadDocumentTypes();
  }

  private loadDocumentTypes(): void {
    this.leaseService.getTenantDocumentTypes().subscribe({
      next: (resp: any) => {
        const list = resp?.content ?? resp ?? [];
        this.documentTypeOptions = (Array.isArray(list) ? list : []).map(
          (item: any) => ({
            label: item.label ?? item.name ?? item.value ?? item,
            value: item.value ?? item.label ?? item.name ?? item,
          }),
        );
      },
      error: (err) => console.error('Failed to load document types:', err),
    });
  }
  get todayStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  clearError(): void {
    this.titleError = '';
    this.uploadError = '';
  }

  onStatusChange(): void {
    this.statusError = '';
  }

  onNeverExpireChange(): void {
    if (this.neverExpire) {
      this.expiryDate = '';
      this.expiryDays = null;
      this.daysUntilExpiry = null;
      this.daysLabel = '';
      this.daysPillClass = '';
      this.expiryError = '';
    }
  }

  onDatePickedChange(): void {
    this.expiryError = '';
    if (this.expiryDate) {
      const days = this.calcDaysFromDate(this.expiryDate);
      this.daysUntilExpiry = days;
      this.expiryDays = days;
      this.updatePill(days);
    } else {
      this.expiryDays = null;
      this.daysUntilExpiry = null;
      this.daysLabel = '';
      this.daysPillClass = '';
    }
  }

  onDaysInputChange(): void {
    this.expiryError = '';
    if (this.expiryDays !== null && this.expiryDays >= 0) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + this.expiryDays);
      this.expiryDate = date.toISOString().split('T')[0];
      this.daysUntilExpiry = this.expiryDays;
      this.updatePill(this.expiryDays);
    } else if (this.expiryDays === null || (this.expiryDays as any) === '') {
      this.expiryDate = '';
      this.daysUntilExpiry = null;
      this.daysLabel = '';
      this.daysPillClass = '';
    }
  }

  private calcDaysFromDate(dateStr: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(dateStr);
    expiry.setHours(0, 0, 0, 0);
    return Math.round(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  private updatePill(days: number): void {
    if (days > 0) {
      this.daysLabel = `${days} days left`;
      this.daysPillClass = days > 30 ? 'pill-safe' : 'pill-warn';
    } else if (days === 0) {
      this.daysLabel = 'Expires today';
      this.daysPillClass = 'pill-warn';
    } else {
      this.daysLabel = `Expired (${Math.abs(days)} days ago)`;
      this.daysPillClass = 'pill-expired';
    }
  }

  onExpiryDateChange(): void {
    this.onDatePickedChange();
  }

  private validate(): boolean {
    let valid = true;

    if (!this.documentTitle.trim()) {
      this.titleError = 'Document title is required.';
      valid = false;
    }

    if (!this.neverExpire && !this.expiryDate) {
      this.expiryError = 'Expiry date is required, or enable "Never Expire".';
      valid = false;
    }

    if (
      !this.isEditMode &&
      (!this.uploadedFile || !this.uploadedFiles.length)
    ) {
      this.uploadError = 'Please upload a document.';
      valid = false;
    }

    return valid;
  }

  uploadDocument(): void {
    if (!this.validate()) return;

    const docId = this.document?.document_id ?? this.document?.id ?? null;

    const payload: any = {
      documents: [
        {
          file_name: this.uploadedFile?.file?.name ?? this.document?.file_name,
          file_data: this.uploadedFile
            ? (this.uploadedFile.base64?.split(',')[1] ??
              this.uploadedFile.base64)
            : null,
          title: this.documentTitle,
          never_expire: this.neverExpire,
          expiry_date: this.neverExpire ? null : this.expiryDate,
        },
      ],
    };

    if (this.isEditMode && docId !== null) {
      payload['document_id'] = docId;
    }

    if (this.isEditMode) {
      this.documenattionService.updateTenantDocument(payload).subscribe({
        next: (resp) => {
          this.documentUploaded.emit(resp);
          this.resetForm();
        },
        error: () => {
          this.uploadError = 'Unable to update document. Please try again.';
        },
      });
    } else {
      this.documenattionService.uploadTenantDocument(payload).subscribe({
        next: (resp) => {
          this.documentUploaded.emit(resp);
          this.resetForm();
        },
        error: () => {
          this.uploadError = 'Unable to upload document. Please try again.';
        },
      });
    }
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

  private resetForm(): void {
    this.documentTitle = '';
    this.documentStatus = '';
    this.neverExpire = false;
    this.expiryDate = '';
    this.expiryDays = null;
    this.daysUntilExpiry = null;
    this.daysLabel = '';
    this.daysPillClass = '';
    this.uploadedFile = null;
    this.uploadedFiles = [];
    this.titleError = '';
    this.statusError = '';
    this.expiryError = '';
    this.uploadError = '';
  }
  setDocument(document: any): void {
    if (!document) return;

    this.documentTitle = document.title ?? '';
    this.documentStatus = document.status ?? '';

    this.neverExpire =
      document.never_expire ?? document.does_not_expire ?? false;

    this.expiryDate = document.expiry_date ?? '';

    if (this.expiryDate && !this.neverExpire) {
      this.onDatePickedChange();
    } else {
      this.expiryDays = null;
      this.daysLabel = '';
      this.daysPillClass = '';
    }

    this.uploadedFile = null;

    const fileName = document.file_name ?? document.title ?? 'Document';

    this.uploadedFiles = [
      {
        tempId: Date.now(),
        fileName: fileName,
        name: fileName,
        progress: 100,
        base64: '',
        status: 'done',
        file: { name: fileName, size: 0 },
      } as any,
    ];
  }
}
