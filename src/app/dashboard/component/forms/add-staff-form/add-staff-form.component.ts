import { Component } from '@angular/core';

import { ModalFormCardComponent } from '../../modal-form-card/modal-form-card.component';
import { CustomSelectComponent } from '../../custom-select/custom-select.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-staff-form',
  standalone: true,
  imports: [ModalFormCardComponent, CustomSelectComponent, TranslateModule],
  templateUrl: './add-staff-form.component.html',
  styleUrl: './add-staff-form.component.css',
})
export class AddStaffFormComponent {
  selectedType: string = '';

  onOptionSelected(option: string) {
    this.selectedType = option;
  }
}
