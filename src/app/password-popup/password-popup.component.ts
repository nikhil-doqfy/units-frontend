import {
  Component,
  ElementRef,
  HostListener,
  Output,
  EventEmitter,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../user/services/user.service';
import { PasswordIconComponent } from '../auth/component/icons/password-icon/password-icon.component';
import { PasswordHideIconComponent } from '../auth/component/icons/password-hide-icon/password-hide-icon.component';
import { PasswordShowIconComponent } from '../auth/component/icons/password-show-icon/password-show-icon.component';
import { CrossIconComponent } from '../dashboard/component/icons/cross-icon/cross-icon.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../auth/services/auth.service';
@Component({
  selector: 'app-password-popup',
  standalone: true,
  imports: [
    TranslateModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PasswordIconComponent,
    PasswordHideIconComponent,
    PasswordShowIconComponent,
    CrossIconComponent,
  ],
  templateUrl: './password-popup.component.html',
  styleUrl: './password-popup.component.css',
})
export class PasswordPopupComponent {
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  oldPassword: string = '';
  isOpen: boolean = false;
  newPassword: string = '';
  confirmPassword: string = '';
  changePasswordForm: FormGroup;
  showConfirmPassword = false;
  @Output() submitPassword = new EventEmitter<{
    oldPassword: string;
    newPassword: string;
  }>();

  @Output() closePopup = new EventEmitter<void>();
  constructor(private fb: FormBuilder) {
    this.changePasswordForm = this.fb.group(
      {
        oldPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatchValidator },
    );
  }

  passwordsMatchValidator(form: FormGroup) {
    const newPass = form.get('newPassword')?.value;
    const confirmPass = form.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { passwordMismatch: true };
  }
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  togglePopup() {
    this.isOpen = !this.isOpen;
  }

  close() {
    this.closePopup.emit();
  }

  applyChange() {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    const payload = {
      current_password: this.changePasswordForm.get('oldPassword')?.value,
      new_password: this.changePasswordForm.get('newPassword')?.value,
      new_confirm_password:
        this.changePasswordForm.get('confirmPassword')?.value,
    };

    this.authService
      .changePassword(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          alert('Password changed successfully!');

          this.submitPassword.emit({
            oldPassword: payload.current_password,
            newPassword: payload.new_password,
          });
        },
        error: (err) => {
          console.error('Password change failed', err);
          alert(err.error?.message || 'Password change failed!');
        },
      });
  }
}
