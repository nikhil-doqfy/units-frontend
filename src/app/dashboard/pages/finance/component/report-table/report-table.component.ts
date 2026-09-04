import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TablePaginationComponent } from '../../../../component/table-pagination/table-pagination.component';
import { PageChange } from '../../../../../shared/model/shared.model';

export interface ReportColumn {
  key: string;
  label: string;
  align?: string;
}

/**
 * Shared table shape for Epic 2's report pages (Trial Balance, P&L, Balance
 * Sheet, Ageing) -- per Spine AD-12. Renders exactly what it's given: no
 * formatting or computation on `rows`/`totals` values (NFR1).
 *
 * `paginated` composes the existing `app-table-pagination` component
 * beneath the rows and simply forwards its `(pageChange)` upward unchanged
 * -- the `componentName`-matching guard convention lives in the consuming
 * report page, not here (see `all-leads.component.ts:272-283`).
 */
@Component({
  selector: 'app-report-table',
  standalone: true,
  imports: [CommonModule, TablePaginationComponent],
  templateUrl: './report-table.component.html',
  styleUrl: './report-table.component.css',
})
export class ReportTableComponent {
  @Input() columns: ReportColumn[] = [];
  @Input() rows: Record<string, string | number>[] = [];
  @Input() totals?: Record<string, string | number>;
  @Input() paginated = false;

  @Input() componentName: string | undefined = undefined;
  @Input() currentPage = 1;
  @Input() totalRecords = 0;
  @Input() rowsPerPage = 0;
  @Input() disabled = false;

  // Story 4.2: opt-in row-click affordance. Defaults to `false` so every
  // existing consumer (P&L, Balance Sheet, Ageing) that passes neither this
  // input nor `rowClick` renders and behaves byte-identically to before.
  @Input() clickableRows = false;

  @Output() pageChange = new EventEmitter<PageChange>();
  @Output() rowClick = new EventEmitter<Record<string, string | number>>();

  onPageChange(event: PageChange): void {
    this.pageChange.emit(event);
  }

  onRowClick(row: Record<string, string | number>): void {
    if (!this.clickableRows) return;
    this.rowClick.emit(row);
  }
}
