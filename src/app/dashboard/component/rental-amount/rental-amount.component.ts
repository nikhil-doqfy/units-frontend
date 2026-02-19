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

  ngOnChanges() {
    if (this.percentage === null) return;

    if (this.percentage < 5) {
      this.badgeClass = 'badge-success';
      this.trend = 'up';
    } else if (this.percentage < 15) {
      this.badgeClass = 'badge-warning';
      this.trend = 'up';
    } else {
      this.badgeClass = 'badge-danger';
      this.trend = 'up';
    }
  }
}
