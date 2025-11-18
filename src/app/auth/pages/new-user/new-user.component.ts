import { Component, inject, OnInit, TemplateRef } from '@angular/core';
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
import { EditIconComponent } from '../../../dashboard/component/icons/edit-icon/edit-icon.component';
import { VerifyIconEditComponent } from '../../../icon/verify-icon-edit/verify-icon-edit.component';
import { HeadphoneIconComponent } from '../../../icon/headphone-icon/headphone-icon.component';
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
    EditIconComponent,
    VerifyIconEditComponent,
    HeadphoneIconComponent,
  ],
  templateUrl: './new-user.component.html',
  styleUrl: './new-user.component.css',
})
export class NewUserComponent implements OnInit {
  signupForm!: FormGroup;
  otp = '';
  email = '';

  currentRole: UserRole = 'owner';
  selectedRole: UserRole = 'owner';
  showConfirmPassword = false;
  passwordMismatch = false;
  password: string = '';
  // defaultUserType: string = 'OWNER';
  userType: string = '';
  private modalService = inject(NgbModal);
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

  onOtpChange(evt: any) {
    console.log(evt);
    this.otp = evt;
  }
  goToResetPassword(): void {
    this.modalService.dismissAll();
    this.router.navigate(['/auth/validation'], {
      state: { email: this.email, otp: this.otp },
    });
  }
  ngOnInit() {
    this.signupForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      company_name: [''],
      emirate_id: [''],
      Contact_Number: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      user_type: [''],
    });
  }

  onUserTypeChange(type: string) {
    this.userType = type;
    this.signupForm.get('user_type')?.setValue(type);

    // Clear all validators first
    this.clearAllDynamicValidators();

    if (type === 'OWNER') this.setOwnerValidators();
    if (type === 'PROPERTY_MANAGER') this.setPMCValidators();
    if (type === 'TENANT') this.setTenantValidators();

    this.signupForm.updateValueAndValidity();
  }
  setOwnerValidators() {
    const fields = [
      'first_name',
      'last_name',
      'Contact_Number',
      'email',
      'password',
      'confirmPassword',
    ];

    fields.forEach((f) => {
      this.signupForm.get(f)?.setValidators([Validators.required]);
    });

    this.update();
  }
  setPMCValidators() {
    const fields = [
      'company_name',
      'emirate_id',
      'Contact_Number',
      'email',
      'password',
      'confirmPassword',
    ];

    fields.forEach((f) => {
      this.signupForm.get(f)?.setValidators([Validators.required]);
    });

    this.update();
  }
  setTenantValidators() {
    const fields = [
      'first_name',
      'last_name',
      'Contact_Number',
      'email',
      'password',
      'confirmPassword',
    ];

    fields.forEach((f) => {
      this.signupForm.get(f)?.setValidators([Validators.required]);
    });

    this.update();
  }

  clearAllDynamicValidators() {
    const fields = [
      'first_name',
      'last_name',
      'emirate_id',
      'Contact_Number',
      'email',
      'password',
      'confirmPassword',
    ];

    fields.forEach((field) => {
      this.signupForm.get(field)?.clearValidators();
      this.signupForm.get(field)?.setValue('');
    });

    this.update();
  }

  update() {
    this.signupForm.updateValueAndValidity();
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onRoleChange(): void {
    this.currentRole = this.selectedRole;
    this.themeService.setRole(this.selectedRole);
  }

  openOtpVerifyModal(otpVerifyContent: TemplateRef<any>) {
    const modalRef = this.modalService.open(otpVerifyContent, {
      windowClass: 'otpVerifyMdl',
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
        this.goToResetPassword();
      },
      (reason) => {
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

  checkFormValidity(): void {
    Object.keys(this.signupForm.controls).forEach((field) => {
      const control = this.signupForm.get(field);
      if (control?.invalid) {
        console.log(`❌ INVALID FIELD: ${field}`, control.errors);
      } else {
        console.log(`✅ VALID FIELD: ${field}`);
      }
    });

    console.log(
      'Overall Form Status:',
      this.signupForm.valid ? '✅ VALID' : '❌ INVALID'
    );
  }
  sendOtp(): void {
    this.checkFormValidity();
    const emailCtrl = this.signupForm.get('email');
    emailCtrl?.markAsTouched();
    emailCtrl?.updateValueAndValidity();
    console.log('seda', this.email);
    if (this.signupForm.invalid) {
      console.log('Enter your name');
      this.alert.error('Please enter a valid email');
      return;
    }

    const payload = { email: this.signupForm.value.email };

    this.auth.sendOtp(payload).subscribe({
      next: (resp: any) => {
        console.log('monali', this.email);
        console.log('OTP response:--->', resp);
        this.alert.success(resp?.message || 'OTP sent successfully');
        this.otpSent = true;
        this.emailLocked = true;
        this.otpTimer = 60;
        this.startOtpTimer();
      },
      error: (err) => {
        console.log('OTP error:--->', err);
        this.alert.error(err?.error?.message || 'Failed to send OTP');
      },
    });
  }
  resendOtp(): void {
    this.startOtpTimer();
  }

  WithOtp(): void {
    let payload = {
      email: this.signupForm.value.email,
      otp: this.otp,
    };
    this.auth.verifyOtp(payload).subscribe({
      next: (resp: any) => {
        console.log('OTP verify response: ', resp);
        this.alert.success('Login successful');
      },
      error: (err) => {
        console.log('OTP verify error: ', err);
        this.alert.error(err?.error?.message || 'Invalid OTP');
      },
    });
  }

  onSubmit() {
    console.log('Form submitted');
    console.log('Form values:', this.signupForm.value);
    console.log('Form valid?', this.signupForm.valid);
    if (this.signupForm.invalid) return;
    console.log('signup form invalid');
    const { email, password, confirmPassword } = this.signupForm.value;
    console.log(email, password, confirmPassword);

    this.passwordMismatch = password !== confirmPassword;

    if (this.passwordMismatch) return;

    const payload = {
      email,
      password,
      confirm_password: confirmPassword,
      // user_type: this.defaultUserType,
    };

    this.auth.signup(payload).subscribe({
      next: (res) => {
        console.log('Signup success:', res);
        alert('Signup successful!');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('Signup failed:', err);
        alert('Signup failed. Please try again.');
      },
    });
  }
  goToLogin(): void {
    this.modalService.dismissAll();
    this.router.navigate(['auth/login']);
  }
}
