import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

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
  resetForm!: FormGroup;
  email: string = '';
  otp: string = '';
  password: string = '';
  confirm_password: string = '';

  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const data = history.state;
    this.email = data.email;
    this.otp = data.otp;

    // console.log('EMAIL:', this.email);
    // console.log('OTP:', this.otp);

    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  resetPassword() {
    if (!this.password || !this.confirm_password) {
      alert('Please enter both password fields');
      return;
    }

    if (this.password !== this.confirm_password) {
      alert('Passwords do not match');
      return;
    }
    const data = {
      email: this.email,
      otp: this.otp,
      password: this.password,
      confirm_password: this.confirm_password,
    };

    console.log('DATA SENT:', data);
    this.auth.resetPassword(data).subscribe({
      next: () => {
        alert('Password reset successful!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.log(err);
        alert(err.error?.message || 'Something went wrong');
      },
    });
  }

  goToDashboard(): void {
    this.router.navigate(['dashboard/home']);
  }
}
