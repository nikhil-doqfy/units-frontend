import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService, ARRow } from '../../../../finance/finance.service';
import { WhiteCardComponent } from '../../../../shared/component/white-card/white-card.component';
import { SharedService } from '../../../../shared.service';
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../../shared/model/shared.model';
import { TableTitleComponent } from '../../../component/table-title/table-title.component';
import { TableSearchComponent } from '../../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../../component/table-filter-btn/table-filter-btn.component';
import { ExportIconComponent } from '../../../component/icons/export-icon/export-icon.component';
import { TableSelectComponent } from '../../../component/table-select/table-select.component';
import { TablePaginationComponent } from '../../../component/table-pagination/table-pagination.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-ar-by-unit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    WhiteCardComponent,
    TableTitleComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    ExportIconComponent,
    TableSelectComponent,
    TablePaginationComponent,
    TranslateModule,
  ],
  templateUrl: './ar-by-unit.component.html',
  styleUrl: './ar-by-unit.component.css',
})
export class ArByUnitComponent implements OnInit {
  private financeService = inject(FinanceService);
  private sharedService = inject(SharedService);

  breadcrumbData: BreadCrumb[] = [];
  rows: ARRow[] = [];
  filtered: ARRow[] = [];
  loading = true;

  searchText = '';
  selectedProperty = 'All';
  properties = ['All'];

  // ── Table state ──────────────────────────────────
  tenants: any[] = [];
  totalRecords = 0;
  rowsPerPage = 10;
  currentPage = 1;
  totalPages = 1;
  rowsPerPageOptions = [10, 25, 50, 100];
  componentName = 'TenantsComponent';

  get totalAmount(): number {
    return this.filtered.reduce((s, r) => s + r.amount, 0);
  }

  ngOnInit(): void {
    this.sharedService
      .getBreadcrumbs([
        { label: 'Finance', link: '/dashboard/finance/overview' },
        { label: 'Accounts Receivable', link: '' },
        { label: 'Outstanding by Unit', link: '' },
      ])
      .subscribe((data) => (this.breadcrumbData = data));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.financeService.getARByUnit().subscribe({
      next: (data) => {
        this.rows = data;
        const props = [...new Set(data.map((r) => r.property))];
        this.properties = ['All', ...props];
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  applyFilter(): void {
    let r = [...this.rows];
    if (this.selectedProperty !== 'All')
      r = r.filter((x) => x.property === this.selectedProperty);
    const q = this.searchText.toLowerCase().trim();
    if (q)
      r = r.filter(
        (x) =>
          x.unit.toLowerCase().includes(q) ||
          x.tenant.toLowerCase().includes(q) ||
          x.property.toLowerCase().includes(q) ||
          x.ref.toLowerCase().includes(q),
      );
    this.filtered = r;
  }

  onSearch(v: string): void {
    this.searchText = v;
    this.applyFilter();
  }
  onPropertyChange(): void {
    this.applyFilter();
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Outstanding: 'ar-status-blue',
      Partial: 'ar-status-orange',
      Overdue: 'ar-status-red',
    };
    return map[status] ?? 'ar-status-grey';
  }

  exportCSV(): void {
    const header = 'Unit,Tenant,Property,Ref,Due Date,Amount,Status\n';
    const rows = this.filtered
      .map(
        (r) =>
          `${r.unit},"${r.tenant}","${r.property}",${r.ref},${r.due_date},${r.amount},${r.status}`,
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ar-by-unit.csv';
    a.click();
  }
  onRefresh() {}
  onPageChange(event: PageChange) {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
  }

  onPageSizeChange(event: PageSizeChange) {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
  }
}
