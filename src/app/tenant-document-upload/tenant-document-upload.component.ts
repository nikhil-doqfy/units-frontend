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

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { UploadDocumentComponent } from '../dashboard/component/upload-document/upload-document.component';
import { DocumenattionService } from '../service/documenattion.service';
import { FileUploadItemComponent } from '../dashboard/component/file-upload-item/file-upload-item.component';
import { UploadFileModel } from '../shared/model/shared.model';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LeaseService } from '../dashboard/services/lease.service';
import { CustomSelectComponent } from '../dashboard/component/custom-select/custom-select.component';
import { SharedApiService } from '../shared/services/shared-api.service';

@Component({
  selector: 'app-tenant-document-upload',
  standalone: true,
  imports: [
    UploadDocumentComponent,
    FileUploadItemComponent,
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    CustomSelectComponent,
  ],
  templateUrl: './tenant-document-upload.component.html',
  styleUrl: './tenant-document-upload.component.css',
})
export class TenantDocumentUploadComponent implements OnChanges, OnInit {
  private documenattionService = inject(DocumenattionService);
  private leaseService = inject(LeaseService);
  private fb = inject(FormBuilder);

  private sharedApiService = inject(SharedApiService);
  @ViewChild('uploadTenantDocumentModal')
  uploadTenantDocumentModal!: TemplateRef<any>;

  @Output() documentUploaded = new EventEmitter<any>();

  @Input() document: any = null;
  @Input() isEditMode = false;

  documentForm!: FormGroup;

  documentTypeOptions: any[] = [];
  selectedDocumentType: any = null;

  pmcList: any[] = [];
  selectedPmc: string | null = null;

  daysUntilExpiry: number | null = null;
  daysLabel = '';
  daysPillClass = '';

  titleError = '';
  statusError = '';
  expiryError = '';
  uploadError = '';

  uploadedFile: any = null;
  uploadedFiles: UploadFileModel[] = [];

  ngOnInit(): void {
    this.createForm();
    this.loadDocumentTypes();
    this.loadPmcOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['document'] && this.document && this.documentForm) {
      const doc = this.document;

      const normalized = {
        ...doc,
        never_expire: doc.never_expire ?? doc.does_not_expire ?? false,
        file_name: doc.file_name ?? doc.title ?? '',
      };

      this.setDocument(normalized);
    }
  }

  /**
   * Create Reactive Form
   */
  private createForm(): void {
    this.documentForm = this.fb.group({
      document_type_id: [null, Validators.required],

      document_title: ['', [Validators.required, Validators.maxLength(255)]],

      document_status: [''],

      never_expire: [false],

      expiry_date: [null],

      expiry_days: [null],

      pmc_id: [null],
    });
  }

  /**
   * Load document types
   */
  private loadDocumentTypes(): void {
    this.leaseService.getTenantDocumentTypes().subscribe({
      next: (resp: any) => {
        this.documentTypeOptions = resp?.content?.tenant_document_type ?? [];

        if (this.document) {
          this.setDocument(this.document);
        }
      },

      error: (err) => {
        console.error('Document Type API Error:', err);
      },
    });
  }

  /**
   * Today's date
   */
  get todayStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * PMC selected
   */
  onOptionSelectedPMC(option: any): void {
    this.selectedPmc = option;

    this.documentForm.patchValue({
      pmc_id: option?.key ?? null,
    });
  }

  /**
   * Document type selected
   */
  onDocumentTypeSelected(option: any): void {
    this.selectedDocumentType = option;

    this.documentForm.patchValue({
      document_type_id: option?.key ?? null,
      document_title: option?.value ?? '',
    });

    this.clearError();
  }

  /**
   * Clear errors
   */
  clearError(): void {
    this.titleError = '';
    this.uploadError = '';
  }

  /**
   * Status changed
   */
  onStatusChange(): void {
    this.statusError = '';
  }

  private loadPmcOptions(): void {
    this.sharedApiService.getOptionsType([
      {
        param: 'PMC_BY_PM',
        key: 'pmc',
        params: {},
        setter: (data: any[]) => {
          this.pmcList = data ?? [];
        },
      },
    ]);
  }
  /**
   * Never expire changed
   */
  onNeverExpireChange(): void {
    const neverExpire = this.documentForm.get('never_expire')?.value;

    if (neverExpire) {
      this.documentForm.patchValue({
        expiry_date: null,
        expiry_days: null,
      });

      this.daysUntilExpiry = null;
      this.daysLabel = '';
      this.daysPillClass = '';
      this.expiryError = '';
    }
  }

  /**
   * Expiry date changed
   */
  onDatePickedChange(): void {
    this.expiryError = '';

    const expiryDate = this.documentForm.get('expiry_date')?.value;

    if (expiryDate) {
      const days = this.calcDaysFromDate(expiryDate);

      this.documentForm.patchValue({
        expiry_days: days,
      });

      this.daysUntilExpiry = days;

      this.updatePill(days);
    } else {
      this.documentForm.patchValue({
        expiry_days: null,
      });

      this.daysUntilExpiry = null;
      this.daysLabel = '';
      this.daysPillClass = '';
    }
  }

  /**
   * Expiry days changed
   */
  onDaysInputChange(): void {
    this.expiryError = '';

    const expiryDays = this.documentForm.get('expiry_days')?.value;

    if (expiryDays !== null && expiryDays !== '' && Number(expiryDays) >= 0) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);

      date.setDate(date.getDate() + Number(expiryDays));

      const expiryDate = date.toISOString().split('T')[0];

      this.documentForm.patchValue({
        expiry_date: expiryDate,
      });

      this.daysUntilExpiry = Number(expiryDays);

      this.updatePill(Number(expiryDays));
    } else {
      this.documentForm.patchValue({
        expiry_date: null,
      });

      this.daysUntilExpiry = null;
      this.daysLabel = '';
      this.daysPillClass = '';
    }
  }

  /**
   * Calculate days
   */
  private calcDaysFromDate(dateStr: string): number {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const expiry = new Date(dateStr);

    expiry.setHours(0, 0, 0, 0);

    return Math.round(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  /**
   * Update expiry pill
   */
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

  /**
   * Expiry date change
   */
  onExpiryDateChange(): void {
    this.onDatePickedChange();
  }

  /**
   * Validate form
   */
  private validate(): boolean {
    let valid = true;

    this.titleError = '';
    this.expiryError = '';
    this.uploadError = '';

    const titleControl = this.documentForm.get('document_title');

    const neverExpire = this.documentForm.get('never_expire')?.value;

    const expiryDate = this.documentForm.get('expiry_date')?.value;

    /**
     * Mark all required controls touched
     */
    this.documentForm.markAllAsTouched();

    /**
     * Document type
     */
    if (this.documentForm.get('document_type_id')?.invalid) {
      valid = false;
    }

    /**
     * Document title
     */
    if (titleControl?.invalid) {
      this.titleError = 'Document title is required.';

      valid = false;
    }

    /**
     * Expiry
     */
    if (!neverExpire && !expiryDate) {
      this.expiryError = 'Expiry date is required, or enable "Never Expire".';

      valid = false;
    }

    /**
     * File required only for create
     */
    if (
      !this.isEditMode &&
      (!this.uploadedFile || !this.uploadedFiles.length)
    ) {
      this.uploadError = 'Please upload a document.';

      valid = false;
    }

    return valid;
  }

  /**
   * Upload / Update document
   */
  uploadDocument(): void {
    if (!this.validate()) {
      return;
    }

    const formValue = this.documentForm.getRawValue();

    const docId = this.document?.document_id ?? this.document?.id ?? null;

    const payload: any = {
      pmc_id: formValue.pmc_id,
      documents: [
        {
          file_name:
            this.uploadedFile?.file?.name ?? this.document?.file_name ?? '',

          file_data: this.uploadedFile
            ? (this.uploadedFile.base64?.split(',')[1] ??
              this.uploadedFile.base64)
            : null,

          document_type_id: formValue.document_type_id,

          title: formValue.document_title,

          never_expire: formValue.never_expire,

          expiry_date: formValue.never_expire ? null : formValue.expiry_date,
        },
      ],
    };

    /**
     * Add document ID during edit
     */
    if (this.isEditMode && docId !== null) {
      payload['document_id'] = docId;
    }

    /**
     * Update
     */
    if (this.isEditMode) {
      this.documenattionService.updateTenantDocument(payload).subscribe({
        next: (resp) => {
          this.documentUploaded.emit(resp);
          this.resetForm();
        },

        error: (err) => {
          console.error('Update Document Error:', err);

          this.uploadError = 'Unable to update document. Please try again.';
        },
      });

      return;
    }

    /**
     * Create
     */
    this.documenattionService.uploadTenantDocument(payload).subscribe({
      next: (resp) => {
        this.documentUploaded.emit(resp);
        this.resetForm();
      },

      error: (err) => {
        console.error('Upload Document Error:', err);

        this.uploadError = 'Unable to upload document. Please try again.';
      },
    });
  }

  /**
   * File uploaded
   */
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

  /**
   * Remove file
   */
  removeFile(file: UploadFileModel): void {
    this.uploadedFiles = this.uploadedFiles.filter(
      (item) => item.tempId !== file.tempId,
    );

    this.uploadedFile = null;
  }

  /**
   * Reset form
   */
  private resetForm(): void {
    this.documentForm.reset({
      document_type_id: null,
      document_title: '',
      document_status: '',
      never_expire: false,
      expiry_date: null,
      expiry_days: null,
      pmc_id: null,
    });

    this.selectedDocumentType = null;
    this.selectedPmc = null;

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

  /**
   * Set document data in edit mode
   */
  setDocument(document: any): void {
    if (!document || !this.documentForm) {
      return;
    }

    this.document = document;

    const neverExpire =
      document.never_expire ?? document.does_not_expire ?? false;

    const expiryDate = document.expiry_date ?? null;

    const documentType =
      this.documentTypeOptions.find(
        (item: any) => item.key === document.document_type_id,
      ) ?? null;

    this.selectedDocumentType = documentType;

    const title = documentType?.value ?? document.title ?? '';

    this.selectedPmc = document.pmc_id ?? null;

    /**
     * Patch Reactive Form
     */
    this.documentForm.patchValue({
      document_type_id: document.document_type_id ?? null,

      document_title: title,

      document_status: document.status ?? '',

      never_expire: neverExpire,

      expiry_date: expiryDate,

      expiry_days: null,

      pmc_id: document.pmc_id ?? null,
    });

    /**
     * Calculate expiry days
     */
    if (expiryDate && !neverExpire) {
      const days = this.calcDaysFromDate(expiryDate);

      this.documentForm.patchValue({
        expiry_days: days,
      });

      this.daysUntilExpiry = days;

      this.updatePill(days);
    } else {
      this.daysUntilExpiry = null;
      this.daysLabel = '';
      this.daysPillClass = '';
    }

    /**
     * Existing document file
     */
    this.uploadedFile = null;

    let fileName = document.file_name ?? document.title ?? 'Document';

    if (!fileName.includes('.') && document.url) {
      const cleanUrl = document.url.split('?')[0];

      const ext = cleanUrl.substring(cleanUrl.lastIndexOf('.'));

      if (ext && ext.length >= 2 && ext.length <= 5) {
        fileName += ext;
      }
    }

    this.uploadedFiles = [
      {
        tempId: Date.now(),
        fileName,
        name: fileName,
        progress: 100,
        base64: '',
        status: 'done',
        file: {
          name: fileName,
          size: 0,
        },
      } as any,
    ];
  }
}
