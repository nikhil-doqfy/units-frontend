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

@Component({
  selector: 'app-new-user',
  standalone: true,
  imports: [CommonModule, AuthTitleComponent, AuthFormComponent, EmailIconComponent, PasswordIconComponent, PasswordHideIconComponent, PasswordShowIconComponent, PasswordStrengthFieldComponent, NewUserLinkComponent],
  templateUrl: './new-user.component.html',
  styleUrl: './new-user.component.css'
})
export class NewUserComponent {
  password = '';
  showConfirmPassword = false;
  constructor(private router: Router) { }
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  goToLogin(): void {
    this.router.navigate(['auth/login']);
  }
}
