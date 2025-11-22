import { Component } from '@angular/core';

import { ModalFormCardComponent } from '../../modal-form-card/modal-form-card.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-invite-pmc-form',
  standalone: true,
  imports: [ModalFormCardComponent, TranslateModule],
  templateUrl: './invite-pmc-form.component.html',
  styleUrl: './invite-pmc-form.component.css',
})
export class InvitePMCFormComponent {}
