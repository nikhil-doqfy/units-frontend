import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CustomSelectComponent } from '../../custom-select/custom-select.component';
import { SharedApiService } from '../../../../shared/services/shared-api.service';
import { LeadsService } from '../../../services/leads.service';
import { FormService } from '../../../../shared/services/form.service';

@Component({
  selector: 'app-edit-leads-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    CustomSelectComponent,
  ],
  templateUrl: './edit-leads-form.component.html',
  styleUrl: './edit-leads-form.component.css',
})
export class EditLeadsFormComponent implements OnInit {
  @Input() editData: any = null;
  @Output() formSubmitted = new EventEmitter<boolean>();

  private fb = inject(FormBuilder);
  private sharedApiService = inject(SharedApiService);
  private leadsService = inject(LeadsService);
  private formService = inject(FormService);

  isInvalid = this.formService.isInvalid.bind(this.formService);

  leadForm!: FormGroup;
  propertyOptions: { key: number; value: string }[] = [];
  unitOptions: { key: number; value: string; rent?: string }[] = [];

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

  get preSelectedProperty() {
    return this.editData?.property_id
      ? { key: this.editData.property_id, value: this.editData.property_name }
      : null;
  }

  get preSelectedUnit() {
    return this.editData?.unit_id
      ? { key: this.editData.unit_id, value: this.editData.unit_name }
      : null;
  }

  get preSelectedStatus() {
    return (
      this.statusOptions.find((o) => o.key === this.editData?.status) ?? null
    );
  }

  get preSelectedPlatform() {
    return (
      this.platformOptions.find((o) => o.key === this.editData?.platform) ??
      null
    );
  }

  ngOnInit() {
    this.leadForm = this.fb.group({
      unit_id: [this.editData?.unit_id ?? null, Validators.required],
      name: [this.editData?.name ?? '', Validators.required],
      email: [
        this.editData?.email ?? '',
        [Validators.required, Validators.email],
      ],
      contact_number: [
        this.editData?.contact_number ?? '',
        Validators.required,
      ],
      amount: [this.editData?.rent ?? null],
      status: [this.editData?.status ?? 'INTERESTED', Validators.required],
      comment: [''],
      platform: [this.editData?.platform ?? 'DIRECT', Validators.required],
      lead_type: [this.editData?.lead_type ?? 'EMAIL', Validators.required],
    });

    this.sharedApiService.getOptionsType([
      {
        param: 'PARENT_PROPERTY',
        key: 'property',
        setter: (v) => (this.propertyOptions = v),
      },
    ]);

    if (this.editData?.property_id) {
      this.sharedApiService.getOptionsType([
        {
          param: 'PROPERTY_UNIT_BY_PROPERTY',
          key: 'property_unit',
          setter: (v) => (this.unitOptions = v),
          params: { property_id: this.editData.property_id },
        },
      ]);
    }
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
      comment: val.comment || '',
    };
    this.leadsService.updateLead(this.editData.id, payload).subscribe({
      next: () => this.formSubmitted.emit(true),
      error: () => this.formSubmitted.emit(false),
    });
  }
}
