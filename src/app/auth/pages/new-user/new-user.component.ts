import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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
@Component({
  selector: 'app-new-user',
  standalone: true,
  imports: [
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
  ],
  templateUrl: './new-user.component.html',
  styleUrl: './new-user.component.css',
})
export class NewUserComponent {
  signupForm!: FormGroup;

  currentRole: UserRole = 'owner';
  selectedRole: UserRole = 'owner';
  showConfirmPassword = false;
  passwordMismatch = false;
  password: string = '';
  defaultUserType: string = 'OWNER';

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private fb: FormBuilder,
    private auth: AuthService,
    private storage: StorageService,
    private alert: AlertService
  ) {}

  ngOnInit() {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onRoleChange(): void {
    this.currentRole = this.selectedRole;
    this.themeService.setRole(this.selectedRole);
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
      user_type: this.defaultUserType, // ✅ Default
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
    this.router.navigate(['auth/login']);
  }
}
