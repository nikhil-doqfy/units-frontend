import { Component, Input } from '@angular/core';

import { ModalFormCardComponent } from '../../modal-form-card/modal-form-card.component';
import { TranslateModule } from '@ngx-translate/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-role-form',
  standalone: true,
  imports: [
    ModalFormCardComponent,
    TranslateModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './add-role-form.component.html',
  styleUrl: './add-role-form.component.css',
})
export class AddRoleFormComponent {
  @Input() form!: FormGroup;
}
