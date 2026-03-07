import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ArrowDownIconComponent } from '../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
import { AmountCreditedIconComponent } from '../icons/amount-credited-icon/amount-credited-icon.component';
import { ChequesBounceIconComponent } from '../icons/cheques-bounce-icon/cheques-bounce-icon.component';
import { AmountFailedIconComponent } from '../icons/amount-failed-icon/amount-failed-icon.component';

@Component({
  selector: 'app-status-action-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    ArrowDownIconComponent,
    AmountCreditedIconComponent,
    ChequesBounceIconComponent,
    AmountFailedIconComponent,
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
}
