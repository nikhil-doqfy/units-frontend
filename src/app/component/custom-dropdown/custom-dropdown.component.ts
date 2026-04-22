import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { ArrowDownIconComponent } from '../../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
import { ReceiptIconComponent } from '../../icons/receipt-icon/receipt-icon.component';
import { CommonModule } from '@angular/common';
import { ArrowUpIconComponent } from '../../shared/component/icons/arrow-up-icon/arrow-up-icon.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [
    ArrowDownIconComponent,
    CommonModule,
    ArrowUpIconComponent,
    NgbDropdownModule,
  ],
  templateUrl: './custom-dropdown.component.html',
  styleUrl: './custom-dropdown.component.css',
})
export class CustomDropdownComponent {
  isOpen = false;
  @Input() title: string = '';
  @Input() hasIcon: boolean = true;

  showReceiptDropdown = false;
  showMonthDropdown = false;

  selectedReceiptType = '';

  @Output() detailViewChanges = new EventEmitter<boolean>();
  constructor(private eRef: ElementRef) {}

  selectReceiptType(type: string) {
    this.selectedReceiptType = type;
    this.showMonthDropdown = true;
    this.detailViewChanges.emit(false);
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.showReceiptDropdown = true;
      this.showMonthDropdown = false;
    } else {
      this.showReceiptDropdown = false;
      this.showMonthDropdown = false;
    }

    this.showReceiptDropdown = true;
  }
  onDropdownOpenChange(open: boolean) {
    this.isOpen = open;
    if (!open) {
      this.showReceiptDropdown = false;
      this.showMonthDropdown = false;
    }
  }

  closeDropdown() {
    this.isOpen = false;
    this.showReceiptDropdown = false;
    this.showMonthDropdown = false;
  }
  // 👉 OUTSIDE CLICK DETECTION (MAIN LOGIC)
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }
}
