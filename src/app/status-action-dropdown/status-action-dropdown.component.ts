import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ArrowDownIconComponent } from '../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
import { AmountCreditedIconComponent } from '../icons/amount-credited-icon/amount-credited-icon.component';
import { ChequesBounceIconComponent } from '../icons/cheques-bounce-icon/cheques-bounce-icon.component';
import { AmountFailedIconComponent } from '../icons/amount-failed-icon/amount-failed-icon.component';
import { ArrowUpIconComponent } from '../shared/component/icons/arrow-up-icon/arrow-up-icon.component';

@Component({
  selector: 'app-status-action-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    ArrowDownIconComponent,
    AmountCreditedIconComponent,
    ChequesBounceIconComponent,
    AmountFailedIconComponent,
    ArrowUpIconComponent,
  ],
  templateUrl: './status-action-dropdown.component.html',
  styleUrl: './status-action-dropdown.component.css',
})
export class StatusActionDropdownComponent {
  @Input() status: string = 'Amount Credited';

  isOpen = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  get statusColorClass(): string {
    const s = (this.status || '').toLowerCase();
    if (s.includes('credit') || s.includes('paid') || s.includes('realiz'))
      return 'status-green';
    if (s.includes('bounce') || s.includes('fail')) return 'status-orange';
    if (s.includes('invoice') || s.includes('generat')) return 'status-grey';
    if (s.includes('pending') || s.includes('balance')) return 'status-yellow';
    return '';
  }
}
