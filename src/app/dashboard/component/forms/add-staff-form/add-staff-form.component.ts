import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';

import { ModalFormCardComponent } from '../../modal-form-card/modal-form-card.component';
import { CustomSelectComponent } from '../../custom-select/custom-select.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedApiService } from '../../../../shared/services/shared-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { StaffService } from '../../../services/staff.service';
import { Router } from '@angular/router';
import { AlertService } from '../../../../shared/services/alert.service';
import { CommonModule } from '@angular/common';
import { FormService } from '../../../../shared/services/form.service';

@Component({
  selector: 'app-add-staff-form',
  standalone: true,
  imports: [
    ModalFormCardComponent,
    CustomSelectComponent,
    TranslateModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './add-staff-form.component.html',
  styleUrl: './add-staff-form.component.css',
})
export class AddStaffFormComponent {
  private formService = inject(FormService);
  private fb = inject(FormBuilder);
  private sharedApiService = inject(SharedApiService);
  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);
  private staffService = inject(StaffService);
  private router = inject(Router);

  selectedType: string = '';
  selectedStffRole: any = null;
  assignedPropertyList: any[] = [];
  selectedAssignedProperty: any = null;

  @Input() staffRole: any[] = [];
  @Input() editData: any = null;
  @Output() formSubmitted: EventEmitter<any> = new EventEmitter();
  isInvalid = this.formService.isInvalid;

  staffForm!: FormGroup;
  staffRoleList: any[] = [];
  selectedStaffRole: any = null;

  constructor() {
    this.staffForm = this.fb.group({
      staffName: ['', Validators.required],
      email: ['', Validators.required],
      contactNumber: ['', Validators.required],
      role: [null, Validators.required],
      assigned_property: [null, Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.editData) {
      this.patchEditForm();
      this.staffForm.get('password')?.clearValidators();
      this.staffForm.get('confirmPassword')?.clearValidators();
      this.staffForm.get('password')?.updateValueAndValidity();
      this.staffForm.get('confirmPassword')?.updateValueAndValidity();
      this.staffForm.updateValueAndValidity();
    }
  }

  getOptionTypes(options: string[]) {
    this.sharedApiService
      .getOptions({ option_type: options.join(',') })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.staffRole = response?.content?.role;
          if (this.editData?.staff_role) {
            this.selectedStaffRole = this.staffRole.find(
              (r) => r.key === this.editData.staff_role.key,
            );
          }
        },
      });
  }

  getAssignedProperties(options: string[]) {
    this.sharedApiService
      .getOptions({ option_type: options.join(',') })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          this.assignedPropertyList = resp?.content?.property_unit ?? [];

          if (this.editData?.assigned_property) {
            this.selectedAssignedProperty = this.assignedPropertyList.find(
              (p) => p.key === this.editData.assigned_property.key,
            );
          }
        },
      });
  }

  onAssignedPropertySelected(option: any) {
    this.selectedAssignedProperty = option;

    if (option?.value) {
      this.staffForm.patchValue({
        assigned_property: option.value,
      });
    } else {
      this.staffForm.patchValue({ assigned_property: null });
    }
  }

  handleFilterClick(): void {
    this.getAssignedProperties(['PROPERTY_UNIT']);
  }
  onOptionSelectedUserType(option: any) {
    this.selectedStffRole = option;

    if (option?.value) {
      this.staffForm.patchValue({
        role: option.value,
      });
    } else {
      this.staffForm.patchValue({ role: null });
    }
  }
  onOptionSelected(option: string) {
    this.selectedType = option;
  }

  handleStaffRole(): void {
    this.getOptionTypes(['ROLE']);
  }
  submitStaffForm() {
    this.staffForm.markAllAsTouched();
    if (!this.staffForm.valid) return;

    const form = this.staffForm.value;

    const data: any = {
      staff_name: form.staffName,
      email: form.email,
      contact_number: form.contactNumber,
      role: form.role,
      assigned_property: form.assigned_property,
      password: form.password,
      confirm_password: form.confirmPassword,
    };

    // ---------- EDIT ----------
    if (this.editData?.staff_id) {
      data.staff_id = this.editData.staff_id;

      this.staffService
        .editUserStaff(data)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((resp: any) => {
          if (resp.status === 200) {
            this.alertService.success(resp.message);
            this.formSubmitted.emit(true);
            this.router.navigate(['/dashboard/staff']);
          }
        });
    }

    // ---------- ADD ----------
    this.staffService
      .addNewStaff(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp: any) => {
        if (resp.status === 201) {
          this.alertService.success(resp.message);
          this.formSubmitted.emit(true);
          this.router.navigate(['/dashboard/staff']);
        }
      });
  }

  patchEditForm() {
    if (!this.editData) return;
    this.selectedStaffRole = this.editData.role;
    this.staffForm.patchValue({
      staffName: this.editData.staff_name,
      email: this.editData.email,
      contactNumber: this.editData.contact_number,
      role: this.editData.staff_role?.key,
      assigned_property: this.editData.assigned_property?.key,
      password: '********',
      confirmPassword: '********',
    });
  }
}
