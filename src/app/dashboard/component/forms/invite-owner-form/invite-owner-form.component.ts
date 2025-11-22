import { Component, inject } from '@angular/core';

import { ModalFormCardComponent } from '../../modal-form-card/modal-form-card.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormService } from '../../../../shared/services/form.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-invite-owner-form',
  standalone: true,
  imports: [ModalFormCardComponent, ReactiveFormsModule, TranslateModule],
  templateUrl: './invite-owner-form.component.html',
  styleUrl: './invite-owner-form.component.css',
})
export class InviteOwnerFormComponent {
  private formBuilder = inject(FormBuilder);
  private formService = inject(FormService);

  pmcOwnerForm!: FormGroup;
  isInvalid = this.formService.isInvalid;

  // ------------------------- Invited by PMC TO Owner -------------------------
  constructor() {
    this.pmcOwnerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
}
