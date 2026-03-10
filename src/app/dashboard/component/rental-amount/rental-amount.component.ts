import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ArrowComponent } from '../../../shared/component/icons/arrow/arrow.component';

@Component({
  selector: 'app-rental-amount',
  standalone: true,
  imports: [CommonModule, ArrowComponent],
  templateUrl: './rental-amount.component.html',
  styleUrl: './rental-amount.component.css',
})
export class RentalAmountComponent {
  @Input() amount!: number;
  @Input() percentage: number | null = null;

  badgeClass = '';
  trend: 'up' | 'down' = 'up';

  getBadgeClass() {
    if (this.percentage === null) {
      return '';
    }

    if (this.percentage <= 1) {
      return 'badge-green';
    } else if (this.percentage <= 10) {
      return 'badge-light-green';
    } else if (this.percentage <= 15) {
      return 'badge-orange';
    } else {
      return 'badge-red';
    }
  }
}
