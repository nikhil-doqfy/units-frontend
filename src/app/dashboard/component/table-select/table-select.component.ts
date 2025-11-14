import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageSizeChange } from '../../../shared/model/shared.model';

@Component({
  selector: 'app-table-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-select.component.html',
  styleUrl: './table-select.component.css',
})
export class TableSelectComponent {
  @Input() componentName: string | undefined;
  @Input() rowsPerPage: number = 10;
  @Input() rowsPerPageOptions: number[] = [10, 25, 50, 100];
  @Output() rowsPerPageChange = new EventEmitter<PageSizeChange>();

  onSelect(event: string) {
    this.rowsPerPageChange.emit({
      componentName: this.componentName,
      pageSize: Number(event),
    });
  }
}
