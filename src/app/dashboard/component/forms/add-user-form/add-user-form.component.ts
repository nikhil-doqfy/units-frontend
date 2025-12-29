import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModalFormCardComponent } from '../../modal-form-card/modal-form-card.component';
import { CustomSelectComponent } from '../../custom-select/custom-select.component';
import { EmailIconComponent } from '../../../../auth/component/icons/email-icon/email-icon.component';
import { PasswordShowIconComponent } from '../../../../auth/component/icons/password-show-icon/password-show-icon.component';
import { PasswordHideIconComponent } from '../../../../auth/component/icons/password-hide-icon/password-hide-icon.component';
import { UploadBigIconComponent } from '../../icons/upload-big-icon/upload-big-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormService } from '../../../../shared/services/form.service';
import { SharedApiService } from '../../../../shared/services/shared-api.service';
import { FileService } from '../../../../shared/services/file.service';
import { UserService } from '../../../../user/services/user.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
export class AddUserFormComponent {
  private formService = inject(FormService);
  private formBuilder = inject(FormBuilder);
  private sharedApiService = inject(SharedApiService);
  private destroyRef = inject(DestroyRef);
  private fileService = inject(FileService);
  private userService = inject(UserService);
  private alertService = inject(AlertService);
  private router = inject(Router);

  userImage: string | null = null;
  selectedType: string = '';
  selectedUserType: any = null;
  hidePassword = false;
  hideConfirmPassword = false;
  userForm!: FormGroup;
  userTypeList = [];

  isInvalid = this.formService.isInvalid;

  @ViewChild('fileInput') fileInput!: ElementRef;
  @Input() editData: any = null;

  @Output() formSubmitted: EventEmitter<any> = new EventEmitter();
  // ------------------------- Build user management form  -------------------------

  constructor() {
    this.userForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}'),
        ],
      ],
      contactNumber: [
        '',
        [Validators.required, Validators.pattern(/^\+?\d{6,15}$/)],
      ],
      location: ['', Validators.required],

      role: ['', Validators.required],

      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,20}$'
          ),
        ],
      ],

      confirmPassword: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,20}$'
          ),
        ],
      ],

      imageBase64: ['', Validators.required],
      imageFile: [''],
    });
  }

  ngOnInit() {
    if (this.editData) {
      console.log('Edit Data Received:', this.editData);
      this.patchEditUserForm();
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('confirmPassword')?.clearValidators();
      this.userForm.updateValueAndValidity();
    }
  }

  // ------------------------- Access user type  -------------------------

  getOptionTypes(options: string[]) {
    this.sharedApiService
      .getOptions({ option_type: options.join(',') })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.userTypeList = response?.content?.user_role ?? [];
        },
      });
  }

  handleFilterClick(): void {
    this.getOptionTypes(['USER_ROLE']);
    console.log('Filter button clicked');
  }
  onOptionSelectedUserType(option: any) {
    console.log('OPTION FROM SELECT:', option);
    this.selectedUserType = option;

    if (option?.value) {
      this.userForm.patchValue({
        role: option.key,
      });
    } else {
      this.userForm.patchValue({ role: null });
    }
  }
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      const allowedTypes = ['image/png', 'image/jpeg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only PNG and JPG images are allowed.');
        input.value = '';
        return;
      }

      const base64 = await this.fileService.getFileToBase64(file);
      this.userForm.patchValue({
        imageBase64: base64,
        imageFile: file,
      });
    }
  }

  get imageBase64() {
    return this.userForm.get('imageBase64')?.value;
  }

  // ------------------------- Add new user management form -------------------------

  submitUserForm() {
    this.userForm.markAllAsTouched();
    if (!this.userForm.valid) return;
    var userData = this.userForm.value;
    var data: any = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      contact_number: userData.contactNumber,

      role: userData.role,
      location: userData.location,
      profile_image: userData.imageBase64,
      password: userData.password,
      confirm_password: userData.confirmPassword,
    };

    if (this.editData && this.editData.id) {
      console.log('Editing user with data:', data);
      data['user_id'] = this.editData.id;
      this.editUser(data);
    } else console.log('Adding new user with data:', data);
    this.userService
      .addNewUser(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp: any) => {
        if (resp.status === 201) {
          this.alertService.success(resp.message);
          this.router.navigate(['/dashboard/users']);
        }
      });
  }

  onOptionSelected(option: string) {
    this.selectedType = option;
  }

  togglePasswordHidden(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordHidden(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  // ------------------------- Patched user details -------------------------

  editUser(data: any) {
    this.userService
      .editUserManagement(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp: any) => {
        if (resp.status == 200) {
          this.alertService.success(resp.message);
          this.router.navigate(['/dashboard/users']);
        }
      });
  }

  patchEditUserForm() {
    if (!this.editData) return;
    this.selectedUserType = this.editData.role;
    this.userForm.patchValue({
      firstName: this.editData.first_name,
      lastName: this.editData.last_name,
      email: this.editData.email,
      contactNumber: this.editData.contact_number,
      location: this.editData.location,

      role: this.editData.role.key,
      imageBase64: this.editData.profile_image || '',
      imageFile: '',
      password: '********',
      confirmPassword: '********',
    });

    this.userImage = this.editData.profile_image;
    this.userForm.get('password')?.disable();
    this.userForm.get('confirmPassword')?.disable();
  }
}
