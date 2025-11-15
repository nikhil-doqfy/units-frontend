import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService, UserRole } from '../../../theme.service';
import { NgOtpInputModule } from 'ng-otp-input';

import { AuthTitleComponent } from '../../component/auth-title/auth-title.component';
import { AuthFormComponent } from '../../component/auth-form/auth-form.component';
import { EmailIconComponent } from '../../component/icons/email-icon/email-icon.component';
import { PasswordIconComponent } from '../../component/icons/password-icon/password-icon.component';
import { PasswordHideIconComponent } from '../../component/icons/password-hide-icon/password-hide-icon.component';
import { PasswordShowIconComponent } from '../../component/icons/password-show-icon/password-show-icon.component';
import { NewUserLinkComponent } from '../../component/new-user-link/new-user-link.component';
import { FieldLinkComponent } from '../../component/field-link/field-link.component';
import { TimerTextComponent } from '../../component/timer-text/timer-text.component';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../../shared/services/storage.service';
import { AlertService } from '../../../shared/services/alert.service';
import { Subscription } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgOtpInputModule,
    AuthTitleComponent,
    AuthFormComponent,
    EmailIconComponent,
    PasswordIconComponent,
    PasswordHideIconComponent,
    PasswordShowIconComponent,
    NewUserLinkComponent,
    FieldLinkComponent,
    TimerTextComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  isLoading = false;
  currentRole: UserRole = 'owner';
  selectedRole: UserRole = 'owner';
  authTitle = 'Sign In';
  showPassword = false;
  loginMode: 'password' | 'otp' = 'password';
  email = '';
  password = '';

  otp = '';
  otpSent = false;
  emailLocked = false;
  otpTimer = 60;
  timerDisplay = '1:00';
  timerInterval: any;
  otpForm!: FormGroup;
  constructor(
    private router: Router,
    private fb: FormBuilder,

    private themeService: ThemeService,
    private authService: AuthService,
    private storageService: StorageService,
    private alertService: AlertService
  ) {
    this.themeService.setRole(this.selectedRole);
  }

  onRoleChange(): void {
    this.currentRole = this.selectedRole;
    this.themeService.setRole(this.selectedRole);
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    this.otpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: [''],
    });
  }

  signIn(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.alertService.error('Please enter email and password');
      return;
    }

    let payload = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.authService.login(payload).subscribe({
      next: (resp: any) => {
        console.log('resp:--->', resp);
        this.alertService.success('Login successful');
        this.goToDashboard();
      },
      error: (err) => {
        console.log(err);
        this.alertService.error(err?.error?.message || 'Login failed');
      },
    });
  }

  onOtpChange(evt: any) {
    this.otp = evt;
    this.otpForm.patchValue({ otp: evt });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  switchToOtp(): void {
    this.authTitle = 'Sign In using OTP';
    this.loginMode = 'otp';
  }

  switchToPassword(): void {
    this.authTitle = 'Sign In';
    this.loginMode = 'password';
  }

  goToForgotPassword(): void {
    this.router.navigate(['auth/forgot-password']);
  }

  goToDashboard(): void {
    const role = this.selectedRole;

    switch (role) {
      case 'owner':
        this.router.navigate(['dashboard/home']);
        break;

      case 'property-manager':
        this.router.navigate(['dashboard/home']);
        break;

      case 'tenant':
        this.router.navigate(['dashboard/properties']);
        break;

      default:
        this.router.navigate(['dashboard/properties']);
    }
  }

  sendOtp(): void {
    console.log('seda', this.email);
    if (this.otpForm.invalid) {
      this.alertService.error('Please enter a valid email');
      return;
    }

    const payload = { email: this.otpForm.value.email };

    this.authService.sendOtp(payload).subscribe({
      next: (resp: any) => {
        console.log('monali', this.email);
        console.log('OTP response:--->', resp);
        this.alertService.success(resp?.message || 'OTP sent successfully');
        this.otpSent = true;
        this.emailLocked = true;
        this.otpTimer = 60;
        this.startOtpTimer();
      },
      error: (err) => {
        console.log('OTP error:--->', err);
        this.alertService.error(err?.error?.message || 'Failed to send OTP');
      },
    });
  }

  signInWithOtp(): void {
    if (this.otpForm.invalid) {
      this.alertService.error('Enter a valid email and OTP');
      return;
    }
    const payload = {
      email: this.otpForm.value.email,
      otp: Number(this.otpForm.value.otp),
    };
    this.authService.verifyOtp(payload).subscribe({
      next: (resp: any) => {
        console.log('OTP verify response: ', resp);
        this.alertService.success('Login successful');
        this.goToDashboard();
      },
      error: (err) => {
        console.log('OTP verify error: ', err.err);
        this.alertService.error(err?.error?.message || 'Invalid OTP');
      },
    });
  }

  changeEmail(): void {
    this.otpSent = false;
    this.emailLocked = false;
    clearInterval(this.timerInterval);
    this.otpForm.get('email')?.enable();
    this.otp = '';
    this.otpTimer = 60;
    this.timerDisplay = '1:00';
  }

  private startOtpTimer(): void {
    this.updateTimerDisplay();
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (this.otpTimer > 0) {
        this.otpTimer--;
        this.updateTimerDisplay();
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  private updateTimerDisplay(): void {
    const minutes = Math.floor(this.otpTimer / 60);
    const seconds = this.otpTimer % 60;
    this.timerDisplay = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }

  onResendOtp(): void {
    this.otpTimer = 60;
    this.startOtpTimer();

    this.sendOtp();
  }
}
