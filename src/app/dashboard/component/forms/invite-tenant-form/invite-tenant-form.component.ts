import { Component, inject } from '@angular/core';

import { ModalFormCardComponent } from '../../modal-form-card/modal-form-card.component';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { FormService } from '../../../../shared/services/form.service';

@Component({
  selector: 'app-invite-tenant-form',
  standalone: true,
  imports: [ModalFormCardComponent, ReactiveFormsModule],
  templateUrl: './invite-tenant-form.component.html',
  styleUrl: './invite-tenant-form.component.css',
})
export class InviteTenantFormComponent {
  private formBuilder = inject(FormBuilder);
  private formService = inject(FormService);

  tenantForm!: FormGroup;
  isInvalid = this.formService.isInvalid;

  constructor() {
    this.tenantForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
}
