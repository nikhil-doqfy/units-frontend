import { Component } from '@angular/core';

import { ModalFormCardComponent } from "../../modal-form-card/modal-form-card.component";

@Component({
  selector: 'app-invite-owner-form',
  standalone: true,
  imports: [ModalFormCardComponent],
  templateUrl: './invite-owner-form.component.html',
  styleUrl: './invite-owner-form.component.css'
})

export class InviteOwnerFormComponent {

}

