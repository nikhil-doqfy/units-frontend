import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css',
})
export class TransactionComponent {
  @Input() approvalData: any = null;
  @Input() isApproving: boolean = false;
  @Output() approved = new EventEmitter<void>();
  @Output() rejected = new EventEmitter<void>();

  get violations(): { validation: string; entered: string; required: string }[] {
    if (!this.approvalData) return [];
    const v: { validation: string; entered: string; required: string }[] = [];

    const reqRent = parseFloat(this.approvalData.requested_rent) || 0;
    const actRent = parseFloat(this.approvalData.actual_rent) || 0;
    if (actRent > 0 && reqRent < actRent) {
      v.push({
        validation: 'Annual Rent',
        entered: `AED ${reqRent.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
        required: `Standard AED ${actRent.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
      });
    }

    const reqTenure = this.approvalData.requested_tenure ?? '';
    const actTenure = this.approvalData.actual_tenure ?? '';
    const reqMonths = parseInt(reqTenure, 10) || 0;
    const actMonths = parseInt(actTenure, 10) || 0;
    if (actMonths > 0 && reqMonths > 0 && reqMonths < actMonths) {
      v.push({
        validation: 'Lease Duration',
        entered: reqTenure,
        required: `Minimum ${actTenure} months`,
      });
    }

    return v;
  }
}
