import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-status-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-dropdown.component.html',
  styleUrl: './status-dropdown.component.css',
})
export class StatusDropdownComponent {
  @Input() show = false;
  @Output() select = new EventEmitter<any>();

  options = [
    { label: 'Amount Credited', status: 'green', icon: '✔' },
    { label: 'Cheque Bounce', status: 'orange', icon: '↩' },
    { label: 'Payment Failed', status: 'red', icon: '✖' },
  ];

  onSelect(item: any) {
    this.select.emit(item);
  }
}
