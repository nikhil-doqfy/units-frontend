import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthTitleComponent } from '../../component/auth-title/auth-title.component';
import { AuthFormComponent } from '../../component/auth-form/auth-form.component';
import { PasswordStrengthFieldComponent } from '../../component/password-strength-field/password-strength-field.component';
import { PasswordIconComponent } from '../../component/icons/password-icon/password-icon.component';
import { PasswordHideIconComponent } from '../../component/icons/password-hide-icon/password-hide-icon.component';
import { PasswordShowIconComponent } from '../../component/icons/password-show-icon/password-show-icon.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    AuthTitleComponent,
    AuthFormComponent,
    PasswordStrengthFieldComponent,
    PasswordIconComponent,
    PasswordHideIconComponent,
    PasswordShowIconComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);

  resetForm!: FormGroup;
  email: string = '';
  otp = '';
  password: string = '';
  confirm_password: string = '';
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const data = history.state;
    this.email = data.email;
    this.otp = data.otp;
    this.resetForm = this.fb.group({
      email: [this.email, [Validators.required, Validators.email]],
      otp: [this.otp, Validators.required],
      password: ['', Validators.required],
      confirm_password: ['', Validators.required],
    });
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  resetPassword() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const payload = {
      email: this.resetForm.get('email')?.value,
      otp: this.resetForm.get('otp')?.value,
      password: this.resetForm.get('password')?.value,
      confirm_password: this.resetForm.get('confirm_password')?.value,
    };

    this.auth
      .resetPassword(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.alertService.success(resp.message);
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  goToDashboard(): void {
    this.router.navigate(['dashboard/home']);
  }
}
