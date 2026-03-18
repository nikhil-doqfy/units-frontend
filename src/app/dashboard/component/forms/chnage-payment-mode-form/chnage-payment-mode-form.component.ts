import { Component } from '@angular/core';
import { CustomSelectComponent } from '../../custom-select/custom-select.component';

@Component({
  selector: 'app-chnage-payment-mode-form',
  standalone: true,
  imports: [CustomSelectComponent],
  templateUrl: './chnage-payment-mode-form.component.html',
  styleUrl: './chnage-payment-mode-form.component.css',
})
export class ChnagePaymentModeFormComponent {}
