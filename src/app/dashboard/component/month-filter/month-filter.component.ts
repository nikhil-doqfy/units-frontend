import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-month-filter',
  standalone: true,
  imports: [],
  templateUrl: './month-filter.component.html',
  styleUrl: './month-filter.component.css',
})
export class MonthFilterComponent {
  @Input() selectedMonth!: string;
  @Output() selectedMonthChange = new EventEmitter<string>();

  months = ['Nov 2025', 'Oct 2025', 'Sep 2025'];

  onChange(value: string) {
    this.selectedMonthChange.emit(value);
  }
}
