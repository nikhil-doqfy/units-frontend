import { Component, Input } from '@angular/core';

import { HelpIconComponent } from "../icons/help-icon/help-icon.component";

@Component({
  selector: 'app-field-info',
  standalone: true,
  imports: [HelpIconComponent],
  templateUrl: './field-info.component.html',
  styleUrl: './field-info.component.css'
})
export class FieldInfoComponent {
  @Input() title: string | undefined;
}
