import { Component } from '@angular/core';

import { ModalFormCardComponent } from "../../modal-form-card/modal-form-card.component";

@Component({
  selector: 'app-invite-tenant-form',
  standalone: true,
  imports: [ModalFormCardComponent],
  templateUrl: './invite-tenant-form.component.html',
  styleUrl: './invite-tenant-form.component.css'
})

export class InviteTenantFormComponent {

}

