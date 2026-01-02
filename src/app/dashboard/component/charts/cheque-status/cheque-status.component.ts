import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoIconComponent } from '../../icons/info-icon/info-icon.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cheque-status',
  standalone: true,
  imports: [CommonModule, InfoIconComponent, TranslateModule],
  templateUrl: './cheque-status.component.html',
  styleUrls: ['./cheque-status.component.css'],
})
export class ChequeStatusComponent implements OnChanges {
  @Input() chequeData: any;
  totalCheques = 6000;

  realized = 5680;
  bounced = 2400;
  agingData: any[] = [];
  // Each side is fixed to 50% (so inside each half: 100%)

  ngOnChanges(): void {
    if (!this.chequeData) return;

    this.totalCheques = this.chequeData.total_cheques ?? 0;
    this.realized = this.chequeData.realized ?? 0;
    this.bounced = this.chequeData.bounced ?? 0;

    const aging = this.chequeData.aging_breakup || {};

    this.agingData = [
      { count: aging['0_30'] || 0, label: '0–30 days', bg: '#D7F9DC' },
      { count: aging['31_60'] || 0, label: '31–60 days', bg: '#DAF9F2' },
      { count: aging['61_90'] || 0, label: '61–90 days', bg: '#E0EDFD' },
      { count: aging['90_plus'] || 0, label: '>90 days', bg: '#F1E8FD' },
      {
        count: aging['above_90_days'] || 0,
        label: '>90 days',
        bg: '#F1E8FD',
      },
    ];
  }
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

  // agingData = [
  //   { count: 200, label: '30 days', bg: '#D7F9DC' },
  //   { count: 200, label: '60 days', bg: '#DAF9F2' },
  //   { count: 10, label: '90 days', bg: '#E0EDFD' },
  //   { count: 10, label: '>90 days', bg: '#F1E8FD' },
  // ];
}
