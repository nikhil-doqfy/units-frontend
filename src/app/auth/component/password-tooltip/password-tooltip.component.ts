import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { HelpIconComponent } from "../icons/help-icon/help-icon.component";
import { TickIconComponent } from '../icons/tick-icon/tick-icon.component';

@Component({
  selector: 'app-password-tooltip',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule, HelpIconComponent, TickIconComponent],
  templateUrl: './password-tooltip.component.html',
  styleUrl: './password-tooltip.component.css'
})
export class PasswordTooltipComponent {
}
