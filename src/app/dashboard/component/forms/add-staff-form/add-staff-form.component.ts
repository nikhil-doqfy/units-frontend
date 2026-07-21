import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';

import { ModalFormCardComponent } from '../../modal-form-card/modal-form-card.component';
import { CustomSelectComponent } from '../../custom-select/custom-select.component';
import { CustomMultiSelectComponent } from '../../custom-multi-select/custom-multi-select.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedApiService } from '../../../../shared/services/shared-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { StaffService } from '../../../services/staff.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { CommonModule } from '@angular/common';
import { PasswordIconComponent } from '../../../../auth/component/icons/password-icon/password-icon.component';
import { PasswordShowIconComponent } from '../../../../auth/component/icons/password-show-icon/password-show-icon.component';
import { PasswordHideIconComponent } from '../../../../auth/component/icons/password-hide-icon/password-hide-icon.component';

@Component({
  selector: 'app-add-staff-form',
  standalone: true,
  imports: [
    ModalFormCardComponent,
    CustomSelectComponent,
    CustomMultiSelectComponent,
    TranslateModule,
    CommonModule,
    ReactiveFormsModule,
    PasswordIconComponent,
    PasswordShowIconComponent,
    PasswordHideIconComponent,
  ],
  templateUrl: './add-staff-form.component.html',
  styleUrl: './add-staff-form.component.css',
})
export class AddStaffFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private sharedApiService = inject(SharedApiService);
  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);
  private staffService = inject(StaffService);

  showPassword = false;
  showConfirmPassword = false;

  staffRoleOptions: any[] = [];
  selectedRole: any = null;
  pmcOptions: any[] = [];
  selectedPMC: any[] = [];
  assignedPropertyList: any[] = [];
  selectedAssignedProperties: any[] = [];

  @Input() editData: any = null;
  @Output() formSubmitted = new EventEmitter<boolean>();

  staffForm!: FormGroup;

  get isEditMode(): boolean {
    return !!this.editData?.staff_id;
  }

  constructor() {
    this.staffForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        contactNumber: ['', Validators.required],
        role: [null, Validators.required],
        pmc: [null, Validators.required],
        assigned_property: [[]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit(): void {
    this.loadRoles();
    this.loadPMCs();
    this.loadPropertyUnits();

    if (this.isEditMode) {
      this.staffForm.get('password')?.clearValidators();
      this.staffForm.get('confirmPassword')?.clearValidators();
      this.staffForm.get('password')?.updateValueAndValidity();
      this.staffForm.get('confirmPassword')?.updateValueAndValidity();
      this.staffForm.get('email')?.disable();
      this.patchEditForm();
    }
  }

  private loadRoles(): void {
    this.sharedApiService
      .getOptions({ option_type: 'ROLE' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.staffRoleOptions = response?.content?.role ?? [];
          if (this.isEditMode && this.editData?.staff_role?.key) {
            this.selectedRole =
              this.staffRoleOptions.find(
                (r: any) => r.key === this.editData.staff_role.key,
              ) ?? this.editData.staff_role;
          }
        },
      });
  }

  private patchEditForm(): void {
    this.staffForm.patchValue({
      firstName: this.editData.first_name || '',
      lastName: this.editData.last_name || '',
      email: this.editData.email || '',
      contactNumber: this.editData.contact_number || '',
      role: this.editData.staff_role?.key ?? null,
      pmc: this.editData.pmc?.key ?? null,
    });
  }

  onRoleSelected(option: any): void {
    this.selectedRole = option;
    this.staffForm.patchValue({ role: option?.key ?? null });
  }
  onPMCSelected(options: any[]): void {
    this.selectedPMC = options;

    this.staffForm.patchValue({
      pmc: options.map((o: any) => o.key),
    });
  }
  onAssignedPropertiesSelected(options: any[]): void {
    this.selectedAssignedProperties = options;
    this.staffForm.patchValue({ assigned_property: options.map((o) => o.key) });
  }

  private loadPropertyUnits(): void {
    this.sharedApiService
      .getOptions({ option_type: 'PROPERTY_UNIT' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          this.assignedPropertyList = resp?.content?.property_unit ?? [];
          if (this.isEditMode && this.editData?.assigned_unit_ids?.length) {
            this.selectedAssignedProperties = this.assignedPropertyList.filter(
              (u: any) => this.editData.assigned_unit_ids.includes(u.key),
            );
            this.staffForm.patchValue({
              assigned_property: this.selectedAssignedProperties.map(
                (u: any) => u.key,
              ),
            });
          }
        },
      });
  }

  hasError(field: string, error: string): boolean {
    const ctrl = this.staffForm.get(field);
    return !!(ctrl?.touched && ctrl?.hasError(error));
  }

  get passwordMismatch(): boolean {
    return !!(
      this.staffForm.get('confirmPassword')?.touched &&
      this.staffForm.hasError('passwordMismatch')
    );
  }

  private passwordMatchValidator(
    group: AbstractControl,
  ): ValidationErrors | null {
    const pw = group.get('password')?.value;
    const cpw = group.get('confirmPassword')?.value;
    if (pw && cpw && pw !== cpw) {
      return { passwordMismatch: true };
    }
    return null;
  }

  submitStaffForm(): void {
    this.staffForm.markAllAsTouched();
    if (!this.staffForm.valid) return;

    const form = this.staffForm.getRawValue();

    const data: any = {
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      contact_number: form.contactNumber,
      role: form.role,
      pmcs: form.pmc,
      assigned_property: form.assigned_property,
    };

    if (this.isEditMode) {
      data.staff_id = this.editData.staff_id;
      this.staffService
        .editUserStaff(data)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resp: any) => {
            this.alertService.success(
              resp?.message || 'Staff updated successfully',
            );
            this.formSubmitted.emit(true);
          },
          error: (err: any) => {
            this.alertService.error(err?.error?.message || 'Update failed');
          },
        });
    } else {
      data.password = form.password;
      data.confirm_password = form.confirmPassword;
      this.staffService
        .addNewStaff(data)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resp: any) => {
            this.alertService.success(
              resp?.message || 'Staff added successfully',
            );
            this.formSubmitted.emit(true);
          },
          error: (err: any) => {
            this.alertService.error(err?.error?.message || 'Add failed');
          },
        });
    }
  }
  private loadPMCs(): void {
    this.sharedApiService
      .getOptions({ option_type: 'PMCS' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.pmcOptions = response?.content?.pmcs ?? [];

          if (this.isEditMode && this.editData?.selected_pmcs?.length) {
            this.selectedPMC = this.pmcOptions.filter((pmc: any) =>
              this.editData.selected_pmcs.includes(pmc.key),
            );

            this.staffForm.patchValue({
              pmc: this.selectedPMC.map((pmc: any) => pmc.key),
            });
          }
        },
      });
  }
}
