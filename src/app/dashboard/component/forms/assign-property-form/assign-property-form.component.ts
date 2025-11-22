import { Component } from '@angular/core';

import { ModalFormCardComponent } from '../../modal-form-card/modal-form-card.component';
import { CustomSelectComponent } from '../../custom-select/custom-select.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-assign-property-form',
  standalone: true,
  imports: [ModalFormCardComponent, CustomSelectComponent, TranslateModule],
  templateUrl: './assign-property-form.component.html',
  styleUrl: './assign-property-form.component.css',
})
export class AssignPropertyFormComponent {
  selectedType: string = '';

  onOptionSelected(option: string) {
    this.selectedType = option;
  }
}
