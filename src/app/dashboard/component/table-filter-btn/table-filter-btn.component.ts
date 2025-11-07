import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-table-filter-btn',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-filter-btn.component.html',
  styleUrl: './table-filter-btn.component.css'
})
export class TableFilterButtonComponent {
  @Input() title: string | undefined;
  @Input() hasIcon?: boolean = false;

  @Output() clicked = new EventEmitter<void>();

  onClick(): void {
    this.clicked.emit();
  }
}
