import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { UploadDocumentComponent } from '../../upload-document/upload-document.component';
import { FileUploadItemComponent } from '../../file-upload-item/file-upload-item.component';
import { FormSelectFieldComponent } from '../../../../shared/component/form-select-field/form-select-field.component';
import { UploadFileModel } from '../../../../shared/model/shared.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ComplaintsService } from '../../../complaints.service';
import { FormService } from '../../../../shared/services/form.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { SharedApiService } from '../../../../shared/services/shared-api.service';
import { CustomSelectComponent } from '../../custom-select/custom-select.component';
@Component({
  selector: 'app-add-complaints',
  standalone: true,
  imports: [
    UploadDocumentComponent,
    FileUploadItemComponent,
    FormSelectFieldComponent,
    TranslateModule,
    ReactiveFormsModule,
    CommonModule,
    CustomSelectComponent,
  ],
  templateUrl: './add-complaints.component.html',
  styleUrl: './add-complaints.component.css',
})
export class AddComplaintsComponent {
  @Output() formSubmitted = new EventEmitter<boolean>();
  @Input() complaintData: any = null;
  private fb = inject(FormBuilder);
  private formService = inject(FormService);
  private complaintsService = inject(ComplaintsService);
  private sharedApiService = inject(SharedApiService);
  isInvalid = this.formService.isInvalid.bind(this.formService);
  propertyOptions: { key: number; value: string }[] = [];
  unitOptions: { key: number; value: string; rent?: string }[] = [];
  leadForm!: FormGroup;
  complaintForm!: FormGroup;
  uploadedImages: UploadFileModel[] = [];
  pmcOptions: { key: number; value: string }[] = [];
  selectedPmc: any = null;
  serviceTypeOptions = [
    { key: 'PLUMBER', value: 'Plumber' },
    { key: 'ELECTRICIAN', value: 'Electrician' },
    { key: 'CARPENTER', value: 'Carpenter' },
    { key: 'CLEANING', value: 'Cleaning' },
    { key: 'OTHER', value: 'Other' },
  ];

  priorityOptions = [
    { key: 'LOW', value: 'Low' },
    { key: 'MEDIUM', value: 'Medium' },
    { key: 'HIGH', value: 'High' },
  ];

  ngOnInit(): void {
    this.complaintForm = this.fb.group({
      property: [null, Validators.required],
      pmc: [null],
      unit_id: [null, [Validators.required, Validators.min(1)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      service_type: ['PLUMBER', Validators.required],
      priority: ['HIGH', Validators.required],
      note: [''],
      slot_1: ['', Validators.required],
      slot_2: [''],
      slot_3: [''],
    });

    this.sharedApiService
      .getOptions({ option_type: 'PMC_BY_PM' })
      .subscribe((resp: any) => {
        this.pmcOptions = resp?.content?.pmc ?? [];

        const existing = this.complaintForm.get('pmc')?.value;
        if (existing?.key) {
          this.selectedPmc =
            this.pmcOptions.find((p: any) => p.key === existing.key) ??
            existing;
        }
      });
    if (this.complaintData) {
      this.patchForm(this.complaintData);
    }
  }
  ngOnChanges(): void {
    if (this.complaintData) {
      setTimeout(() => {
        this.patchForm(this.complaintData);
      });
    }
  }

  onPmcSelected(option: any): void {
    this.selectedPmc = option;

    this.complaintForm.patchValue({
      pmc: option,
      property: null,
      unit_id: null,
    });

    this.propertyOptions = [];
    this.unitOptions = [];

    if (!option?.key) {
      return;
    }

    this.loadPropertiesByPmc(option.key);
  }
  loadPropertiesByPmc(pmcId: number): void {
    this.sharedApiService.getOptionsType([
      {
        param: 'PROPERTY_BY_PMC',
        key: 'property',
        setter: (v) => (this.propertyOptions = v),
        params: {
          pmc_id: pmcId,
        },
      },
    ]);
  }
  onPropertySelect(option: any): void {
    this.unitOptions = [];
    this.complaintForm.patchValue({
      property: option,
      unit_id: null,
    });

    if (!option?.key) return;
    this.sharedApiService.getOptionsType([
      {
        param: 'PROPERTY_UNIT_BY_PROPERTY',
        key: 'property_unit',
        setter: (v) => (this.unitOptions = v),
        params: { property_id: option.key },
      },
    ]);
  }

  onUnitSelect(option: any): void {
    this.complaintForm.patchValue({
      unit_id: option?.key ?? null,
    });
  }

  onImageUpload(event: UploadFileModel): void {
    const index = this.uploadedImages.findIndex(
      (item) => item.tempId === event.tempId,
    );

    if (index > -1) {
      this.uploadedImages[index] = event;
    } else {
      this.uploadedImages.push(event);
    }
  }
  patchForm(data: any): void {
    if (!this.complaintForm) return;
    this.complaintForm.patchValue({
      unit_id: data.unit?.id,
      description: data.description,
      service_type: data.service_type,
      priority: data.priority,
      note: data.note ?? '',
      slot_1: data.current_appointment?.slots?.[0]?.proposed_time
        ? new Date(data.current_appointment.slots[0].proposed_time * 1000)
        : null,
    });
  }
  removeImage(tempId: number | undefined): void {
    if (tempId === undefined) return;

    this.uploadedImages = this.uploadedImages.filter(
      (item) => item.tempId !== tempId,
    );
  }
  submitForm(): void {
    if (this.complaintForm.invalid) {
      this.complaintForm.markAllAsTouched();
      return;
    }

    const val = this.complaintForm.value;

    const payload = {
      property_id: val.property?.key,
      pmc_id: val.pmc?.key ?? null,
      unit_id: Number(val.unit_id),
      description: val.description,
      service_type: val.service_type,
      priority: val.priority,
      note: val.note,
      slots: [val.slot_1, val.slot_2, val.slot_3]
        .filter(Boolean)
        .map((slot) => Math.floor(new Date(slot).getTime() / 1000)),
      images: this.uploadedImages
        .filter((image) => image.status === 'done' && image.base64)
        .map((image) => ({
          file_name: image.file.name,
          file_data: image.base64?.split(',')[1] ?? image.base64,
        })),
    };

    if (this.complaintData?.code) {
      this.complaintsService
        .updateComplaint(this.complaintData.code, payload)
        .subscribe({
          next: () => this.formSubmitted.emit(true),
          error: () => this.formSubmitted.emit(false),
        });
    } else {
      this.complaintsService.createComplaint(payload).subscribe({
        next: () => this.formSubmitted.emit(true),
        error: () => this.formSubmitted.emit(false),
      });
    }
  }

  resetForm(): void {
    this.complaintForm.reset({
      service_type: 'PLUMBER',
      priority: 'HIGH',
    });

    this.uploadedImages = [];
  }
}
