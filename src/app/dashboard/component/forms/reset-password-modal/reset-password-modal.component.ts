import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { UserService } from '../../../../user/services/user.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { PasswordIconComponent } from '../../../../auth/component/icons/password-icon/password-icon.component';
import { PasswordShowIconComponent } from '../../../../auth/component/icons/password-show-icon/password-show-icon.component';
import { PasswordHideIconComponent } from '../../../../auth/component/icons/password-hide-icon/password-hide-icon.component';

@Component({
  selector: 'app-reset-password-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PasswordIconComponent,
    PasswordShowIconComponent,
    PasswordHideIconComponent,
  ],
  templateUrl: './reset-password-modal.component.html',
  styleUrl: './reset-password-modal.component.css',
})
export class ResetPasswordModalComponent implements OnInit {
  @Input() userId!: number;
  @Input() userName!: string;

  private fb = inject(FormBuilder);
  private activeModal = inject(NgbActiveModal);
  private userService = inject(UserService);
  private alertService = inject(AlertService);
  form!: FormGroup;
  showNewPassword = false;
  showConfirmPassword = false;

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        new_password: ['', [Validators.required, Validators.minLength(6)]],
        confirm_password: ['', Validators.required],
      },
      {
        validators: (c: AbstractControl): ValidationErrors | null => {
          const match =
            c.get('new_password')?.value === c.get('confirm_password')?.value;
          return match ? null : { passwordMismatch: true };
        },
      },
    );
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to reset password for ${this.userName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0C5490',
      cancelButtonColor: '#ED3237',
      confirmButtonText: 'Yes, change password',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService
          .resetUserPassword({
            user_id: this.userId,
            new_password: this.form.value.new_password,
            confirm_password: this.form.value.confirm_password,
          })
          .subscribe({
            next: (resp: any) => {
              this.alertService.success(
                resp?.message || 'Password reset successfully',
              );
              this.activeModal.close(true);
            },
            error: (err: any) => {
              this.alertService.error(
                err?.error?.message || 'Password reset failed',
              );
            },
          });
      }
    });
  }
}
