import { Component } from '@angular/core';

import { ModalFormCardComponent } from '../../modal-form-card/modal-form-card.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-role-form',
  standalone: true,
  imports: [ModalFormCardComponent, TranslateModule],
  templateUrl: './add-role-form.component.html',
  styleUrl: './add-role-form.component.css',
})
export class AddRoleFormComponent {}
