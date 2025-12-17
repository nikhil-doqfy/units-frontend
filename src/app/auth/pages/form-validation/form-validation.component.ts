import { Component, DestroyRef, inject } from '@angular/core';
import { AuthTitleComponent } from '../../component/auth-title/auth-title.component';
import { AuthFormComponent } from '../../component/auth-form/auth-form.component';
import { Router } from '@angular/router';
import { ArrowIconComponent } from '../../../icon/arrow-icon/arrow-icon.component';
import { AuthService } from '../../services/auth.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertService } from '../../../shared/services/alert.service';
import { FormService } from '../../../shared/services/form.service';
import { ThemeService } from '../../../theme.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-form-validation',
  standalone: true,
  imports: [
    AuthTitleComponent,
    AuthFormComponent,
    ArrowIconComponent,
    ReactiveFormsModule,
    NgIf,
  ],
  templateUrl: './form-validation.component.html',
  styleUrl: './form-validation.component.css',
})
export class FormValidationComponent {
  private alert = inject(AlertService);
  private formServise = inject(FormService);
  private themeService = inject(ThemeService);
  private destroyRef = inject(DestroyRef);

  isInvalid = this.formServise.isInvalid;
  detailForm!: FormGroup;
  currentRole!: string;

  constructor(
    private router: Router,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    if (
      !this.authService.signupData ||
      Object.keys(this.authService.signupData).length < 1
    ) {
      this.router.navigate(['/auth/new-user']);
      return;
    }

    this.initDetailsForm();
  }

  initDetailsForm() {
    this.detailForm = this.formBuilder.group({
      manageThrough: ['MYSELF'],
      emirateId: [
        '',
        [Validators.required, Validators.pattern(/^784-?\d{4}-?\d{7}-?\d$/)],
      ],
      residenceVisa: [
        '',
        [Validators.required, Validators.pattern(/^\d{3}\/?\d{7}\/?\d{6}$/)],
      ],
      tradeLicense: [
        '',
        [Validators.required, Validators.pattern(/^[0-9\/-]{5,15}$/)],
      ],
    });

    this.mangeValidators();
  }

  mangeValidators() {
    this.themeService.currentRole$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((role) => {
        this.currentRole = role;
        if (role === 'owner') {
          this.detailForm
            .get('manageThrough')
            ?.addValidators([Validators.required]);
        } else {
          this.detailForm.get('manageThrough')?.clearValidators();
        }
      });
  }

  goToUploadDocument(): void {
    if (this.detailForm.invalid) {
      this.detailForm.markAllAsTouched();
      this.alert.error('Please fill valid fields before proceeding.');
      return;
    }

    this.authService.signupData = {
      ...this.authService.signupData,
      ...this.detailForm.value,
    };

    this.router.navigate(['/auth/uploadDocument'], {});
  }
  back() {
    this.router.navigate(['/auth/new-user']);
  }
}
