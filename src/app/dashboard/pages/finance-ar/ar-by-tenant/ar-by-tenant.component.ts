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
import { TableSelectComponent } from '../../../component/table-select/table-select.component';
import { TablePaginationComponent } from '../../../component/table-pagination/table-pagination.component';
import { TableTitleComponent } from '../../../component/table-title/table-title.component';
import { TableSearchComponent } from '../../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../../component/table-filter-btn/table-filter-btn.component';
import { ExportIconComponent } from '../../../component/icons/export-icon/export-icon.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-ar-by-tenant',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    WhiteCardComponent,
    TableSelectComponent,
    TablePaginationComponent,
    TableTitleComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    ExportIconComponent,
    TranslateModule,
  ],
  templateUrl: './ar-by-tenant.component.html',
  styleUrl: './ar-by-tenant.component.css',
})
export class ArByTenantComponent implements OnInit {
  private financeService = inject(FinanceService);
  private sharedService = inject(SharedService);

  breadcrumbData: BreadCrumb[] = [];
  rows: ARRow[] = [];
  filtered: ARRow[] = [];
  loading = true;

  // ── Table state ──────────────────────────────────
  tenants: any[] = [];
  totalRecords = 0;
  rowsPerPage = 10;
  currentPage = 1;
  totalPages = 1;
  rowsPerPageOptions = [10, 25, 50, 100];
  componentName = 'TenantsComponent';

  searchText = '';
  selectedStatus = 'All';
  statuses = ['All', 'Outstanding', 'Partial', 'Overdue'];

  get totalAmount(): number {
    return this.filtered.reduce((s, r) => s + r.amount, 0);
  }
  get overdueCount(): number {
    return this.filtered.filter((r) => r.status === 'Overdue').length;
  }

  summaryCards: { label: string; value: string; color: string }[] = [];

  ngOnInit(): void {
    this.sharedService
      .getBreadcrumbs([
        { label: 'Finance', link: '/dashboard/finance/overview' },
        { label: 'Accounts Receivable', link: '' },
        { label: 'Outstanding by Tenant', link: '' },
      ])
      .subscribe((data) => (this.breadcrumbData = data));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.financeService.getARByTenant().subscribe({
      next: (data) => {
        this.rows = data;
        this.buildCards(data);
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
  onRefresh() {}

  private buildCards(data: ARRow[]): void {
    const fmt = (n: number) =>
      'AED ' + new Intl.NumberFormat('en-AE').format(n);
    const total = data.reduce((s, r) => s + r.amount, 0);
    const overdue = data
      .filter((r) => r.status === 'Overdue')
      .reduce((s, r) => s + r.amount, 0);
    const partial = data
      .filter((r) => r.status === 'Partial')
      .reduce((s, r) => s + r.amount, 0);
    const outstanding = data
      .filter((r) => r.status === 'Outstanding')
      .reduce((s, r) => s + r.amount, 0);
    this.summaryCards = [
      { label: 'Total Outstanding', value: fmt(total), color: 'blue' },
      { label: 'Overdue', value: fmt(overdue), color: 'red' },
      { label: 'Partial', value: fmt(partial), color: 'orange' },
      { label: 'Current', value: fmt(outstanding), color: 'green' },
    ];
  }

  applyFilter(): void {
    let r = [...this.rows];
    if (this.selectedStatus !== 'All')
      r = r.filter((x) => x.status === this.selectedStatus);
    const q = this.searchText.toLowerCase().trim();
    if (q)
      r = r.filter(
        (x) =>
          x.tenant.toLowerCase().includes(q) ||
          x.unit.toLowerCase().includes(q) ||
          x.property.toLowerCase().includes(q) ||
          x.ref.toLowerCase().includes(q),
      );
    this.filtered = r;
  }

  onSearch(v: string): void {
    this.searchText = v;
    this.applyFilter();
  }
  onStatusChange(): void {
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
    const header = 'Tenant,Unit,Property,Ref,Due Date,Amount,Status\n';
    const rows = this.filtered
      .map(
        (r) =>
          `"${r.tenant}",${r.unit},"${r.property}",${r.ref},${r.due_date},${r.amount},${r.status}`,
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ar-by-tenant.csv';
    a.click();
  }
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
