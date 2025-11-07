import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

const FILTER_PAG_REGEX = /[^0-9]/g;

@Component({
  selector: 'app-table-pagination',
  standalone: true,
  imports: [CommonModule, NgbPaginationModule],
  templateUrl: './table-pagination.component.html',
  styleUrl: './table-pagination.component.css'
})
export class TablePaginationComponent {
  page = 1;

  selectPage(page: string) {
    this.page = parseInt(page, 10) || 1;
  }

  formatInput(input: HTMLInputElement) {
    input.value = input.value.replace(FILTER_PAG_REGEX, '');
  }
}
