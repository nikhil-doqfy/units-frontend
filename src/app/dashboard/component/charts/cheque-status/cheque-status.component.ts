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

  ngOnChanges(): void {
    if (!this.chequeData) return;

    const summary = this.chequeData.summary || {};

    this.totalCheques = summary.total_cheques ?? 0;
    this.realized = summary.realized_cheques?.count ?? 0;
    this.bounced = summary.bounced_cheques?.count ?? 0;

    const aging = this.chequeData.aging_breakup || {};

    this.agingData = [
      { count: aging['30_days'] ?? 0, label: '0–30 days', bg: '#D7F9DC' },
      { count: aging['60_days'] ?? 0, label: '31–60 days', bg: '#DAF9F2' },
      { count: aging['90_days'] ?? 0, label: '61–90 days', bg: '#E0EDFD' },
      { count: aging['above_90_days'] ?? 0, label: '>90 days', bg: '#F1E8FD' },
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
}
