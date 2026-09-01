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
  selectedPropertyOption: any = null;
  selectedUnitOption: any = null;
  selectedServiceType: any = null;
  selectedPriority: any = null;
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
      });

    if (this.complaintData) {
      this.patchForm(this.complaintData);
    }
  }

  ngOnChanges(): void {
    if (this.complaintData && this.complaintForm) {
      this.patchForm(this.complaintData);
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
    this.selectedPropertyOption = option;
    this.selectedUnitOption = null;
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
    this.selectedUnitOption = option;
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

    // ── 1. Flat fields ─────────────────────────────────────────────────────
    const slot0 =
      data.current_appointment?.slots?.[0]?.proposed_time ??
      data.appointment?.all_slots?.[0]?.proposed_time;
    const slot1 =
      data.current_appointment?.slots?.[1]?.proposed_time ??
      data.appointment?.all_slots?.[1]?.proposed_time;
    const slot2 =
      data.current_appointment?.slots?.[2]?.proposed_time ??
      data.appointment?.all_slots?.[2]?.proposed_time;

    const toDateStr = (epoch: number | null | undefined): string => {
      if (!epoch) return '';
      return new Date(epoch * 1000).toISOString().split('T')[0];
    };

    const serviceTypeKey =
      data.service_type?.key ?? data.service_type ?? 'PLUMBER';
    const priorityKey = data.priority?.key ?? data.priority ?? 'HIGH';

    // Note lives in current_appointment.note (not data.note)
    const note =
      data.current_appointment?.note ??
      data.appointment?.note ??
      data.note ??
      '';

    this.complaintForm.patchValue({
      description: data.description ?? '',
      service_type: serviceTypeKey,
      priority: priorityKey,
      note,
      slot_1: toDateStr(slot0),
      slot_2: toDateStr(slot1),
      slot_3: toDateStr(slot2),
    });

    // Pre-select service type and priority display objects
    this.selectedServiceType =
      this.serviceTypeOptions.find((o) => o.key === serviceTypeKey) ?? null;
    this.selectedPriority =
      this.priorityOptions.find((o) => o.key === priorityKey) ?? null;

    // ── 2. PMC → Property → Unit cascade ──────────────────────────────────
    const pmcKey = data.pmc?.id ?? data.pmc?.key ?? data.unit?.pmc_id ?? null;
    const pmcValue = data.pmc?.name ?? data.pmc?.value ?? null;
    const propertyKey =
      data.unit?.property_id ?? data.property?.id ?? data.property?.key ?? null;
    const propertyValue =
      data.unit?.property_name ??
      data.property?.name ??
      data.property?.value ??
      null;
    const unitKey = data.unit?.id ?? null;
    const unitValue = data.unit?.unit_name ?? data.unit?.value ?? null;

    if (pmcKey) {
      const pmcOption = { key: pmcKey, value: pmcValue ?? String(pmcKey) };
      this.selectedPmc = pmcOption;
      this.complaintForm.patchValue({ pmc: pmcOption });

      this.sharedApiService.getOptionsType([
        {
          param: 'PROPERTY_BY_PMC',
          key: 'property',
          setter: (properties) => {
            this.propertyOptions = properties;

            const propOption =
              properties.find((p: any) => p.key === propertyKey) ??
              (propertyKey
                ? {
                    key: propertyKey,
                    value: propertyValue ?? String(propertyKey),
                  }
                : null);

            if (propOption) {
              this.selectedPropertyOption = propOption;
              this.complaintForm.patchValue({ property: propOption });

              this.sharedApiService.getOptionsType([
                {
                  param: 'PROPERTY_UNIT_BY_PROPERTY',
                  key: 'property_unit',
                  setter: (units) => {
                    this.unitOptions = units;
                    if (unitKey) {
                      const unitOption = units.find(
                        (u: any) => u.key === unitKey,
                      ) ?? {
                        key: unitKey,
                        value: unitValue ?? String(unitKey),
                      };
                      this.selectedUnitOption = unitOption;
                      this.complaintForm.patchValue({ unit_id: unitKey });
                    }
                  },
                  params: { property_id: propOption.key },
                },
              ]);
            }
          },
          params: { pmc_id: pmcKey },
        },
      ]);
    } else if (unitKey) {
      this.complaintForm.patchValue({ unit_id: unitKey });
    }
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
