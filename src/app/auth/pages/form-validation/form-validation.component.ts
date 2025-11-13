import { Component } from '@angular/core';
import { AuthTitleComponent } from '../../component/auth-title/auth-title.component';
import { AuthFormComponent } from '../../component/auth-form/auth-form.component';
import { Router } from '@angular/router';
import { ArrowIconComponent } from '../../../icon/arrow-icon/arrow-icon.component';
@Component({
  selector: 'app-form-validation',
  standalone: true,
  imports: [AuthTitleComponent, AuthFormComponent, ArrowIconComponent],
  templateUrl: './form-validation.component.html',
  styleUrl: './form-validation.component.css',
})
export class FormValidationComponent {
  constructor(private router: Router) {}
  goToResetPassword(): void {
    this.router.navigate(['/auth/uploadDocument'], {});
  }
  back() {
    this.router.navigate(['/auth/new-user']);
  }
}
