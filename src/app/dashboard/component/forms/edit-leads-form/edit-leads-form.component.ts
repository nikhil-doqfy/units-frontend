import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CustomSelectComponent } from '../../custom-select/custom-select.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-leads-form',
  standalone: true,
  imports: [CustomSelectComponent, TranslateModule],
  templateUrl: './edit-leads-form.component.html',
  styleUrl: './edit-leads-form.component.css',
})
export class EditLeadsFormComponent {
  @Input() editData: any = null;
  selectedLead: any = null;
  @Output() formSubmitted = new EventEmitter<any>();

  submitForm() {}
}
