import { Component } from '@angular/core';
import { AuthTitleComponent } from '../../component/auth-title/auth-title.component';
import { AuthFormComponent } from '../../component/auth-form/auth-form.component';
@Component({
  selector: 'app-form-validation',
  standalone: true,
  imports: [AuthTitleComponent, AuthFormComponent],
  templateUrl: './form-validation.component.html',
  styleUrl: './form-validation.component.css',
})
export class FormValidationComponent {}
