import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ArrowDownIconComponent } from '../../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
import { ReceiptIconComponent } from '../../icons/receipt-icon/receipt-icon.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [ArrowDownIconComponent, CommonModule],
  templateUrl: './custom-dropdown.component.html',
  styleUrl: './custom-dropdown.component.css',
})
export class CustomDropdownComponent {
  @Input() title: string = '';
  @Input() hasIcon: boolean = true;

  showReceiptDropdown = false;
  showMonthDropdown = false;

  selectedReceiptType = '';

  @Output() detailViewChanges = new EventEmitter<boolean>();

  selectReceiptType(type: string) {
    this.selectedReceiptType = type;
    this.showMonthDropdown = true;
    this.detailViewChanges.emit(false);
  }

  toggleDropdown() {
    if (this.showReceiptDropdown || this.showMonthDropdown) {
      this.showReceiptDropdown = false;
      this.showMonthDropdown = false;
      return;
    }

    this.showReceiptDropdown = true;
  }
}
