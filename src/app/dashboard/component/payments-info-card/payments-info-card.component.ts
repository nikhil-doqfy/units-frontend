import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-payments-info-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './payments-info-card.component.html',
  styleUrl: './payments-info-card.component.css',
})
export class PaymentsInfoCardComponent {
  @Input() overallAmountPaid!: string;
  @Input() monthlyRent!: string;
  @Input() maintenanceCharges!: string;
  @Input() dueTime!: string;
  @Input() lastDate!: string;

  constructor(private router: Router) {}

  goToPayment(): void {
    this.router.navigate(['dashboard/pay-my-dues']);
  }
}
