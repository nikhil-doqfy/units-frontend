import {
  Component,
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
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '../shared/services/alert.service';
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
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);

  changePasswordForm: FormGroup;
  showCurrentPassword = false;
  showNewPassword = false;
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
      { validators: (c: AbstractControl): ValidationErrors | null => {
          const match = c.get('newPassword')?.value === c.get('confirmPassword')?.value;
          return match ? null : { passwordMismatch: true };
        }
      }
    );
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
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
      new_confirm_password: this.changePasswordForm.get('confirmPassword')?.value,
    };

    this.authService
      .changePassword(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.alertService.success(resp?.message || 'Password changed successfully');
          this.submitPassword.emit({
            oldPassword: payload.current_password,
            newPassword: payload.new_password,
          });
          this.closePopup.emit();
        },
        error: (err: any) => {
          this.alertService.error(err?.error?.message || 'Password change failed');
        },
      });
  }
}
