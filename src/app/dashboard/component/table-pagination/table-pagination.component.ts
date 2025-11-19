import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { PageChange } from '../../../shared/model/shared.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-table-pagination',
  standalone: true,
  imports: [CommonModule, NgbPaginationModule, TranslateModule],
  templateUrl: './table-pagination.component.html',
  styleUrl: './table-pagination.component.css',
})
export class TablePaginationComponent {
  @Input() componentName: string | undefined = undefined;
  @Input() currentPage: number = 1;
  @Input() totalRecords: number = 0;
  @Input() rowsPerPage: number = 0;
  @Input() disabled: boolean = false;
  @Output() pageChange = new EventEmitter<PageChange>();

  onPageChange(event: any) {
    this.currentPage = event;
    this.pageChange.emit({
      currentPage: this.currentPage,
      componentName: this.componentName,
    });
  }
}
