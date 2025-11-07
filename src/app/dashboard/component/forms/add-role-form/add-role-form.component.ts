import { Component } from '@angular/core';

import { ModalFormCardComponent } from "../../modal-form-card/modal-form-card.component";

@Component({
  selector: 'app-add-role-form',
  standalone: true,
  imports: [ModalFormCardComponent],
  templateUrl: './add-role-form.component.html',
  styleUrl: './add-role-form.component.css'
})

export class AddRoleFormComponent {

}

