import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ModalFormCardComponent } from '../../modal-form-card/modal-form-card.component';
import { CustomSelectComponent } from '../../custom-select/custom-select.component';
import { EmailIconComponent } from '../../../../auth/component/icons/email-icon/email-icon.component';
import { PasswordShowIconComponent } from '../../../../auth/component/icons/password-show-icon/password-show-icon.component';
import { PasswordHideIconComponent } from '../../../../auth/component/icons/password-hide-icon/password-hide-icon.component';
import { UploadBigIconComponent } from '../../icons/upload-big-icon/upload-big-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormService } from '../../../../shared/services/form.service';
import { FileService } from '../../../../shared/services/file.service';
import { UserService } from '../../../../user/services/user.service';
import { AlertService } from '../../../../shared/services/alert.service';

@Component({
  selector: 'app-add-user-form',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ModalFormCardComponent,
    CustomSelectComponent,
    EmailIconComponent,
    PasswordShowIconComponent,
    PasswordHideIconComponent,
    UploadBigIconComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './add-user-form.component.html',
  styleUrl: './add-user-form.component.css',
})
export class AddUserFormComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @Input() editData: any = null;
  @Output() formSubmitted = new EventEmitter<boolean>();

  private formService = inject(FormService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private fileService = inject(FileService);
  private userService = inject(UserService);
  private alertService = inject(AlertService);

  isInvalid = this.formService.isInvalid;

  hidePassword = false;
  hideConfirmPassword = false;
  userForm!: FormGroup;
  selectedUserType: any = null;

  readonly userTypeList = [
    { key: 'OWNER',        value: 'Owner' },
    { key: 'TENANT',       value: 'Tenant' },
    { key: 'COMPANY_USER', value: 'Property Manager' },
  ];

  constructor() {
    this.userForm = this.formBuilder.group({
      firstName:      ['', Validators.required],
      lastName:       ['', Validators.required],
      email:          ['', [Validators.required, Validators.email]],
      contactNumber:  ['', [Validators.required, Validators.pattern(/^\+?\d{6,15}$/)]],
      role:           ['', Validators.required],
      password:       ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword:['', [Validators.required, Validators.minLength(8)]],
      imageBase64:    [''],
    });
  }

  ngOnInit() {
    if (this.editData) {
      this.patchEditUserForm();
    }
  }

  onOptionSelectedUserType(option: any) {
    this.selectedUserType = option;
    this.userForm.patchValue({ role: option?.key ?? '' });
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      this.alertService.error('Only PNG and JPG images are allowed.');
      input.value = '';
      return;
    }
    const base64 = await this.fileService.getFileToBase64(file);
    this.userForm.patchValue({ imageBase64: base64 });
  }

  get imageBase64() {
    return this.userForm.get('imageBase64')?.value;
  }

  submitUserForm() {
    this.userForm.markAllAsTouched();
    if (!this.userForm.valid) return;

    const v = this.userForm.value;
    const data: any = {
      first_name:      v.firstName,
      last_name:       v.lastName,
      email:           v.email,
      contact_number:  v.contactNumber,
      role:            v.role,
      profile_image:   v.imageBase64 || null,
      password:        v.password,
      confirm_password:v.confirmPassword,
    };

    if (this.editData?.id) {
      data['user_id'] = this.editData.id;
      this.userService
        .editUserManagement(data)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((resp: any) => {
          if (resp.status === 200) {
            this.alertService.success(resp.message);
            this.formSubmitted.emit(true);
          }
        });
    } else {
      this.userService
        .addNewUser(data)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((resp: any) => {
          if (resp.status === 201) {
            this.alertService.success(resp.message);
            this.formSubmitted.emit(true);
          }
        });
    }
  }

  togglePasswordHidden() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordHidden() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  private patchEditUserForm() {
    if (!this.editData) return;
    this.selectedUserType = this.userTypeList.find(t => t.key === this.editData.role?.key) ?? null;
    this.userForm.patchValue({
      firstName:      this.editData.first_name  ?? '',
      lastName:       this.editData.last_name   ?? '',
      email:          this.editData.email        ?? '',
      contactNumber:  this.editData.contact_number ?? '',
      role:           this.editData.role?.key   ?? '',
      imageBase64:    this.editData.profile_image ?? '',
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.clearValidators();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();
    this.userForm.get('email')?.disable();
  }
}
