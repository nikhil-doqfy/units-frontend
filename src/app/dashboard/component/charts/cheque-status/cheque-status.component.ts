import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoIconComponent } from "../../icons/info-icon/info-icon.component";

@Component({
  selector: 'app-cheque-status',
  standalone: true,
  imports: [CommonModule, InfoIconComponent],
  templateUrl: './cheque-status.component.html',
  styleUrls: ['./cheque-status.component.css']
})
export class ChequeStatusComponent {

  totalCheques = 6000;

  realized = 5680;
  bounced = 2400;

  // Each side is fixed to 50% (so inside each half: 100%)
  get realizedFillPercent() {
    return (this.realized / this.totalCheques) * 100;
  }

  get realizedRemainingPercent() {
    return 100 - this.realizedFillPercent;
  }

  get bouncedFillPercent() {
    return (this.bounced / this.totalCheques) * 100;
  }

  get bouncedRemainingPercent() {
    return 100 - this.bouncedFillPercent;
  }

  agingData = [
    { count: 200, label: '30 days', bg: '#D7F9DC' },
    { count: 200, label: '60 days', bg: '#DAF9F2' },
    { count: 10, label: '90 days', bg: '#E0EDFD' },
    { count: 10, label: '>90 days', bg: '#F1E8FD' }
  ];

}
