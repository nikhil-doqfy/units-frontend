import {
  Component,
  inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgOtpInputModule } from 'ng-otp-input';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthTitleComponent } from '../../component/auth-title/auth-title.component';
import { AuthFormComponent } from '../../component/auth-form/auth-form.component';
import { EmailIconComponent } from '../../component/icons/email-icon/email-icon.component';
import { PasswordIconComponent } from '../../component/icons/password-icon/password-icon.component';
import { PasswordHideIconComponent } from '../../component/icons/password-hide-icon/password-hide-icon.component';
import { PasswordShowIconComponent } from '../../component/icons/password-show-icon/password-show-icon.component';
import { PasswordStrengthFieldComponent } from '../../component/password-strength-field/password-strength-field.component';
import { NewUserLinkComponent } from '../../component/new-user-link/new-user-link.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../../shared/services/alert.service';
import { StorageService } from '../../../shared/services/storage.service';
import { ContactNumberComponent } from '../../../icon/contact-number/contact-number.component';
import { ThemeService, UserRole } from '../../../theme.service';
import { TimerTextComponent } from '../../component/timer-text/timer-text.component';
import { VerifyIconEditComponent } from '../../../icon/verify-icon-edit/verify-icon-edit.component';
import { HeadphoneIconComponent } from '../../../icon/headphone-icon/headphone-icon.component';
import { FormService } from '../../../shared/services/form.service';
@Component({
  selector: 'app-new-user',
  standalone: true,
  imports: [
    NgOtpInputModule,
    CommonModule,
    FormsModule,
    AuthTitleComponent,
    AuthFormComponent,
    EmailIconComponent,
    PasswordIconComponent,
    PasswordHideIconComponent,
    PasswordShowIconComponent,
    PasswordStrengthFieldComponent,
    NewUserLinkComponent,
    ReactiveFormsModule,
    ContactNumberComponent,
    TimerTextComponent,
    VerifyIconEditComponent,
    HeadphoneIconComponent,
  ],
  templateUrl: './new-user.component.html',
  styleUrl: './new-user.component.css',
})
export class NewUserComponent implements OnInit {
  private formService = inject(FormService);
  private modalService = inject(NgbModal);
  isInvalid = this.formService.isInvalid;
  signupForm!: FormGroup;
  otp = '';
  email = '';

  currentRole: UserRole = 'owner';
  selectedRole: UserRole = 'owner';
  showConfirmPassword = false;
  passwordMismatch = false;
  password: string = '';
  isOtpVerificationModalOpen = false;

  @ViewChild('otpVerifyContent') otpVerifyContent!: TemplateRef<any>;

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private fb: FormBuilder,
    private auth: AuthService,
    private storage: StorageService,
    private alert: AlertService
  ) {}

  closeResult = '';
  otpSent = false;
  otpTimer = 0;
  emailLocked = false;
  timerDisplay = '1:00';
  timerInterval: any;
  showResend = false;

  ngOnInit() {
    this.signupForm = this.fb.group({
      first_name: [''],
      last_name: [''],
      company_name: [''],
      emirate_id: [''],
      company_emirate_id: [''],
      contact_number: [''],
      email: ['', [Validators.email]],
      password: [''],
      confirmPassword: [''],
      role: [this.selectedRole],
    });
    this.signupForm.get('role')?.valueChanges.subscribe((value) => {
      this.selectedRole = value;
      this.onRoleChange();
    });

    this.onUserTypeChange(this.currentRole);
  }

  roleFieldMap: Record<string, string[]> = {
    owner: [
      'first_name',
      'last_name',
      'contact_number',
      'email',
      'password',
      'confirmPassword',
    ],
    'property-manager': [
      'company_name',
      'company_emirate_id',
      'contact_number',
      'email',
      'password',
      'confirmPassword',
    ],
    tenant: [
      'first_name',
      'last_name',
      'emirate_id',
      'contact_number',
      'email',
      'password',
      'confirmPassword',
    ],
  };

  onUserTypeChange(type: string) {
    this.clearAllDynamicValidators();

    const fields = this.roleFieldMap[type] || [];

    fields.forEach((field) => {
      const control = this.signupForm.get(field);
      if (!control) return;

      control.addValidators(Validators.required);
      control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    this.signupForm.updateValueAndValidity();
  }

  clearAllDynamicValidators() {
    const allFields = [...new Set(Object.values(this.roleFieldMap).flat())];

    allFields.forEach((field) => {
      const control = this.signupForm.get(field);
      if (!control) return;

      control.removeValidators(Validators.required);

      // control.setValue('');

      control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    this.signupForm.updateValueAndValidity();
  }

  onOtpChange(evt: any) {
    this.otp = evt;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onRoleChange(): void {
    this.currentRole = this.selectedRole;
    this.themeService.setRole(this.selectedRole);
    this.onUserTypeChange(this.currentRole);
  }

  openOtpVerifyModal() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      this.alert.error('Please fill valid fields before requesting OTP');
      return;
    }

    const modalRef = this.modalService.open(this.otpVerifyContent, {
      windowClass: 'otpVerifyMdl',
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });
    this.isOtpVerificationModalOpen = true;

    modalRef.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
        this.isOtpVerificationModalOpen = false;
      },
      (reason) => {
        this.isOtpVerificationModalOpen = false;
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );

    this.startOtpTimer();
  }

  private getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.ESC:
        return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK:
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }

  private startOtpTimer(): void {
    this.otpSent = true;
    this.showResend = false;
    this.otpTimer = 60;

    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      this.otpTimer--;
      const minutes = Math.floor(this.otpTimer / 60);
      const seconds = this.otpTimer % 60;
      this.timerDisplay = `${minutes}:${
        seconds < 10 ? '0' + seconds : seconds
      }`;

      if (this.otpTimer <= 0) {
        clearInterval(this.timerInterval);
        this.showResend = true;
      }
    }, 1000);
  }

  sendOtp(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      this.alert.error('Please fill valid fields before requesting OTP');
      return;
    }

    const payload = { email: this.signupForm.value.email, purpose: 'signup' };

    this.auth.sendOtp(payload).subscribe({
      next: (resp: any) => {
        if (!this.isOtpVerificationModalOpen) {
          this.openOtpVerifyModal();
        }
        this.alert.success(resp?.message);
        this.otpSent = true;
        this.emailLocked = true;
        this.otpTimer = 60;
        this.startOtpTimer();
      },
      error: (err) => {
        console.log('OTP error:--->', err);
      },
    });
  }

  resendOtp(): void {
    this.startOtpTimer();
    this.sendOtp();
  }

  verifyOtp(): void {
    let payload = {
      email: this.signupForm.value.email,
      otp: Number(this.otp),
    };
    let data = { ...this.signupForm.value, userType: this.currentRole };
    this.auth.signupData = data;
    this.auth.verifyOtp(payload).subscribe({
      next: (resp: any) => {
        this.alert.success(resp.message);
        console.log('OTP verified successfully');
        this.router.navigate(['/auth/validation']);
        this.modalService.dismissAll();
      },
      error: (err) => {
        console.log('OTP verify error: ', err);
        this.alert.error(err?.error?.message || 'Invalid OTP');
      },
    });
  }

  goToLogin(): void {
    this.modalService.dismissAll();
    this.router.navigate(['auth/login']);
  }
}
