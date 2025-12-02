import { Component, inject } from '@angular/core';

import { ModalFormCardComponent } from '../../modal-form-card/modal-form-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormService } from '../../../../shared/services/form.service';

@Component({
  selector: 'app-invite-pmc-form',
  standalone: true,
  imports: [ModalFormCardComponent, TranslateModule, ReactiveFormsModule],
  templateUrl: './invite-pmc-form.component.html',
  styleUrl: './invite-pmc-form.component.css',
})
export class InvitePMCFormComponent {
  private formBuilder = inject(FormBuilder);
  private formService = inject(FormService);

  isInvalid = this.formService.isInvalid;
  invitePmcForm = this.formBuilder.group({
    email: ['', [Validators.required]],
  });
}
