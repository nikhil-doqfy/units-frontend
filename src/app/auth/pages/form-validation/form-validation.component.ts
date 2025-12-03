import { Component, inject } from '@angular/core';
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
@Component({
  selector: 'app-form-validation',
  standalone: true,
  imports: [
    AuthTitleComponent,
    AuthFormComponent,
    ArrowIconComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './form-validation.component.html',
  styleUrl: './form-validation.component.css',
})
export class FormValidationComponent {
  private alert = inject(AlertService);
  private formServise = inject(FormService);
  isInvalid = this.formServise.isInvalid;
  detailForm!: FormGroup;

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
    console.log(this.authService.signupData);

    // const userType = this.authService.signupData['userType'];
    this.detailForm = formBuilder.group({
      manageThrough: ['MYSELF', [Validators.required]],

      // company_emirate_id: [
      //   '',
      //   userType === 'PROPERTY_MANAGER' ? Validators.required : [],
      // ],
      emirateId: ['', [Validators.required]],
      residenceVisa: ['', [Validators.required]],
      tradeLicense: ['', [Validators.required]],
    });
  }
  goToResetPassword(): void {
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
