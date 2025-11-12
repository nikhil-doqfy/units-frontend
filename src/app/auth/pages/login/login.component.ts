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
    FormsModule, // ✅ Add this line
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
  // password = '';

  otp = '';
  otpSent = false;
  emailLocked = false;
  otpTimer = 60;
  timerDisplay = '1:00';
  timerInterval: any;

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
    // Create Reactive Form
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  // signIn(): void {
  //   // Use reactive form validation instead of manual if check
  //   if (this.loginForm.invalid) {
  //     this.loginForm.markAllAsTouched(); // show errors
  //     this.alertService.error('Please enter email and password');
  //     return;
  //   }

  //   let payload = {
  //     email: this.loginForm.value.email,
  //     password: this.loginForm.value.password,
  //   };

  //   // const payload = this.loginForm.value;

  //   this.authService.login(payload).subscribe({
  //     next: (resp: any) => {
  //       console.log('resp:--->', resp);
  //       this.alertService.success('Login successful');
  //       // this.goToDashboard();
  //     },
  //     error: (err) => {
  //       console.log(err);
  //       this.alertService.error(err?.error?.message || 'Login failed');
  //     },
  //   });
  // }

  checkFormValidity(): void {
    Object.keys(this.loginForm.controls).forEach((field) => {
      const control = this.loginForm.get(field);
      if (control?.invalid) {
        console.log(`❌ INVALID FIELD: ${field}`, control.errors);
      } else {
        console.log(`✅ VALID FIELD: ${field}`);
      }
    });

    console.log(
      'Overall Form Status:',
      this.loginForm.valid ? '✅ VALID' : '❌ INVALID'
    );
  }
  signIn(): void {
    // console.log('monali');
    this.checkFormValidity();
    if (this.loginForm.invalid) {
      // console.log('monal');
      // this.loginForm.markAllAsTouched(); // show errors
      this.alertService.error('Please enter email and password');
      return;
    }
    this.isLoading = true;
    const payload = this.loginForm.value;

    this.authService.login(payload).subscribe({
      next: (resp: any) => {
        console.log('resp:--->', resp);
        this.isLoading = false;
        // console.log('Login Response:', resp);
        // this.alertService.success('Login successful');
        // this.goToDashboard();
        if (resp && resp.token) {
          this.storageService.setToken(resp.token);
          this.alertService.success('Login successful!');
          this.router.navigate(['/dashboard']); // redirect to dashboard
        } else {
          this.alertService.error('Token not found in response');
        }
      },

      error: (err) => {
        console.log(err);
        this.alertService.error(err?.error?.message || 'Login failed');
      },
    });
  }

  onOtpChange(evt: any) {
    this.otp = evt;
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
    const role = this.selectedRole; // or this.themeService.currentRole

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
    if (!this.email) {
      this.alertService.error('Please enter your email');
      return;
    }

    let payload = { email: this.email };

    this.authService.sendOtp(payload).subscribe({
      next: (resp: any) => {
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
    if (!this.email || !this.otp) {
      this.alertService.error('Enter email and OTP');
      return;
    }
    let payload = {
      email: this.email,
      otp: this.otp,
    };
    this.authService.verifyOtp(payload).subscribe({
      next: (resp: any) => {
        console.log('OTP verify response: ', resp);
        this.alertService.success('Login successful');
        this.goToDashboard();
      },
      error: (err) => {
        console.log('OTP verify error: ', err);
        this.alertService.error(err?.error?.message || 'Invalid OTP');
      },
    });
  }

  changeEmail(): void {
    this.otpSent = false;
    this.emailLocked = false;
    clearInterval(this.timerInterval);
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
