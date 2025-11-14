import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthTitleComponent } from '../../component/auth-title/auth-title.component';
import { AuthFormComponent } from '../../component/auth-form/auth-form.component';
import { PasswordStrengthFieldComponent } from "../../component/password-strength-field/password-strength-field.component";
import { PasswordIconComponent } from '../../component/icons/password-icon/password-icon.component';
import { PasswordHideIconComponent } from '../../component/icons/password-hide-icon/password-hide-icon.component';
import { PasswordShowIconComponent } from '../../component/icons/password-show-icon/password-show-icon.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, AuthTitleComponent, AuthFormComponent, PasswordStrengthFieldComponent, PasswordIconComponent, PasswordHideIconComponent, PasswordShowIconComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})

export class ResetPasswordComponent {
  password = '';
  showConfirmPassword = false;

  constructor(private router: Router) { }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToDashboard(): void {
    this.router.navigate(['dashboard/home']);
  }
}

