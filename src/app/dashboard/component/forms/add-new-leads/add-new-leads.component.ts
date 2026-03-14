import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomSelectComponent } from '../../custom-select/custom-select.component';
import { UploadFileModel } from '../../../../shared/model/shared.model';
import { UploadDocumentComponent } from '../../upload-document/upload-document.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedApiService } from '../../../../shared/services/shared-api.service';
import { LeadsService } from '../../../services/leads.service';
import { FormService } from '../../../../shared/services/form.service';
import { FormSelectFieldComponent } from '../../../../shared/component/form-select-field/form-select-field.component';

@Component({
  selector: 'app-add-new-leads',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomSelectComponent,
    UploadDocumentComponent,
    TranslateModule,
    FormSelectFieldComponent,
  ],
  templateUrl: './add-new-leads.component.html',
  styleUrl: './add-new-leads.component.css',
})
export class AddNewLeadsComponent implements OnInit {
  @Input() editData: any = null;
  @Output() formSubmitted = new EventEmitter<boolean>();
  @Output() tabChanged = new EventEmitter<'manual' | 'bulk'>();

  private fb = inject(FormBuilder);
  private sharedApiService = inject(SharedApiService);
  private leadsService = inject(LeadsService);
  private formService = inject(FormService);

  isInvalid = this.formService.isInvalid.bind(this.formService);

  leadForm!: FormGroup;
  propertyOptions: { key: number; value: string }[] = [];
  unitOptions: { key: number; value: string; rent?: string }[] = [];
  uploadedFile?: UploadFileModel;
  activeTab: 'manual' | 'bulk' = 'manual';

  statusOptions = [
    { key: 'INTERESTED', value: 'Interested' },
    { key: 'NOT_INTERESTED', value: 'Not Interested' },
    { key: 'LEASE_TENANCY', value: 'Lease/Tenancy' },
  ];

  platformOptions = [
    { key: 'DIRECT', value: 'Direct' },
    { key: 'REFERRAL', value: 'Referral' },
    { key: 'PROPERTY_FINDER', value: 'Property Finder' },
    { key: 'BAYUT', value: 'Bayut' },
  ];

  ngOnInit() {
    this.leadForm = this.fb.group({
      unit_id: [null, Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contact_number: ['', Validators.required],
      amount: [null],
      status: ['INTERESTED', Validators.required],
      comment: [''],
      platform: ['DIRECT', Validators.required],
      lead_type: ['EMAIL', Validators.required],
      sendAppLink: [false],
    });

    this.sharedApiService.getOptionsType([
      {
        param: 'PARENT_PROPERTY',
        key: 'property',
        setter: (v) => (this.propertyOptions = v),
      },
    ]);
  }

  onPropertySelect(option: any): void {
    this.unitOptions = [];
    this.leadForm.patchValue({ unit_id: null, amount: null });
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
    const unit = this.unitOptions.find((u) => u.key === option?.key);
    this.leadForm.patchValue({
      unit_id: option?.key ?? null,
      amount: unit?.rent ? parseFloat(unit.rent) : null,
    });
  }

  fillDummyData(): void {
    this.leadForm.patchValue({
      name: 'John Doe',
      email: 'johndoe@example.com',
      contact_number: '+971501234567',
      amount: 75000,
      status: 'INTERESTED',
      comment: 'Interested in 2BHK unit',
      platform: 'PROPERTY_FINDER',
      lead_type: 'EMAIL',
      sendAppLink: true,
    });
  }

  submitForm(): void {
    if (this.leadForm.invalid) {
      this.leadForm.markAllAsTouched();
      return;
    }
    const val = this.leadForm.value;
    const payload = {
      unit_id: val.unit_id,
      name: val.name,
      email: val.email,
      contact_number: val.contact_number,
      status: val.status,
      platform: val.platform,
      lead_type: val.lead_type,
    };
    this.leadsService.createLead(payload).subscribe({
      next: () => this.formSubmitted.emit(true),
      error: () => this.formSubmitted.emit(false),
    });
  }

  setTab(tab: 'manual' | 'bulk') {
    this.activeTab = tab;
    this.tabChanged.emit(tab);
  }

  sampleCsvDownload(): void {
    const headers = ['unit_id', 'name', 'email', 'contact_number', 'status', 'platform', 'lead_type'];
    const sample = ['1', 'John Doe', 'john@example.com', '+971501234567', 'INTERESTED', 'DIRECT', 'EMAIL'];
    const csvContent = [headers.join(','), sample.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  onBulkUpload(event: UploadFileModel) {
    if (event.status === 'done') {
      this.uploadedFile = event;
    }
  }

  uploadBulkFile(): void {
    if (!this.uploadedFile?.base64) return;
    this.leadsService.bulkImportLeads(this.uploadedFile.base64).subscribe({
      next: () => {
        this.formSubmitted.emit(true);
      },
      error: () => {
        this.formSubmitted.emit(false);
      },
    });
  }
}
