import { Component } from '@angular/core';

import { ModalFormCardComponent } from "../../modal-form-card/modal-form-card.component";
import { CustomSelectComponent } from "../../custom-select/custom-select.component";

@Component({
  selector: 'app-add-staff-form',
  standalone: true,
  imports: [ModalFormCardComponent, CustomSelectComponent],
  templateUrl: './add-staff-form.component.html',
  styleUrl: './add-staff-form.component.css'
})

export class AddStaffFormComponent {
  selectedType: string = '';

  onOptionSelected(option: string) {
    this.selectedType = option;
  }
}

