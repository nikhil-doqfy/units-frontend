import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { FieldLinkComponent } from "../../component/field-link/field-link.component";
import { TimerTextComponent } from "../../component/timer-text/timer-text.component";

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
    TimerTextComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  currentRole: UserRole = 'owner';
  selectedRole: UserRole = 'owner';
  authTitle = 'Sign In';
  showPassword = false;
  loginMode: 'password' | 'otp' = 'password';

  otpSent = false;
  emailLocked = false;
  otpTimer = 60;
  timerDisplay = '1:00';
  timerInterval: any;

  constructor(private router: Router, private themeService: ThemeService) {
    this.themeService.setRole(this.selectedRole);
  }

  onRoleChange(): void {
    this.currentRole = this.selectedRole;
    this.themeService.setRole(this.selectedRole);
  }

  onOtpChange(evt: any) { }

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
    this.otpSent = true;
    this.emailLocked = true;
    this.otpTimer = 60;
    this.startOtpTimer();
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
  }
}
