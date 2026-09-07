import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { TablePaginationComponent } from '../../../../component/table-pagination/table-pagination.component';
import { TableSelectComponent } from '../../../../component/table-select/table-select.component';
import {
  PageChange,
  PageSizeChange,
} from '../../../../../shared/model/shared.model';

export interface ReportColumn {
  key: string;
  label: string;
  align?: string;
  // Opt-in: renders this column's value through Angular's `date` pipe
  // ('medium' -- 'MMM d, y, h:mm:ss a') instead of raw interpolation. Every
  // other column keeps rendering exactly what it's given (NFR1).
  // 'label' is for the totals row only (e.g. the 'FINANCE_TOTAL' key in the
  // first cell) -- never applied to regular `rows` data, which is real
  // account names/values that must never be run through translate.
  type?: 'date' | 'label';
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
  imports: [
    CommonModule,
    TablePaginationComponent,
    TableSelectComponent,
    DatePipe,
    TranslateModule,
  ],
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
  @Input() rowsPerPageOptions: number[] = [10, 25, 50, 100];
  @Input() disabled = false;

  // Story 4.2: opt-in row-click affordance. Defaults to `false` so every
  // existing consumer (P&L, Balance Sheet, Ageing) that passes neither this
  // input nor `rowClick` renders and behaves byte-identically to before.
  @Input() clickableRows = false;

  @Output() pageChange = new EventEmitter<PageChange>();
  @Output() pageSizeChange = new EventEmitter<PageSizeChange>();
  @Output() rowClick = new EventEmitter<Record<string, string | number>>();

  onPageChange(event: PageChange): void {
    this.pageChange.emit(event);
  }

  onPageSizeChange(event: PageSizeChange): void {
    this.pageSizeChange.emit(event);
  }

  onRowClick(row: Record<string, string | number>): void {
    if (!this.clickableRows) return;
    this.rowClick.emit(row);
  }

  // Only the totals row's 'label'-typed cell (e.g. 'FINANCE_TOTAL') ever
  // goes through this -- always a translation-key string in practice, but
  // typed `string | number` like every other cell value, so this coerces
  // for the `translate` pipe's `string`-only signature.
  asLabel(value: string | number): string {
    return String(value);
  }
}
