import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService, AgeingRow } from '../../../../finance/finance.service';
import { WhiteCardComponent } from '../../../../shared/component/white-card/white-card.component';
import { SharedService } from '../../../../shared.service';
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../../shared/model/shared.model';
import { TableSearchComponent } from '../../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../../component/table-filter-btn/table-filter-btn.component';
import { ExportIconComponent } from '../../../component/icons/export-icon/export-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { TableTitleComponent } from '../../../component/table-title/table-title.component';
import { TableSelectComponent } from '../../../component/table-select/table-select.component';
import { TablePaginationComponent } from '../../../component/table-pagination/table-pagination.component';

type Bucket = 'All' | 'Current' | '1-30' | '31-60' | '61-90' | '90+';

@Component({
  selector: 'app-ageing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    TableSearchComponent,
    TableFilterButtonComponent,
    ExportIconComponent,
    TableTitleComponent,
    TableSelectComponent,
    TablePaginationComponent,
  ],
  templateUrl: './ageing.component.html',
  styleUrl: './ageing.component.css',
})
export class AgeingComponent implements OnInit {
  private financeService = inject(FinanceService);
  private sharedService = inject(SharedService);

  breadcrumbData: BreadCrumb[] = [];
  rows: AgeingRow[] = [];
  filtered: AgeingRow[] = [];
  loading = true;

  searchText = '';
  activeBucket: Bucket = 'All';
  buckets: Bucket[] = ['All', 'Current', '1-30', '31-60', '61-90', '90+'];

  summaryCards: {
    bucket: Bucket;
    label: string;
    amount: number;
    count: number;
    color: string;
  }[] = [];

  // ── Table state ──────────────────────────────────
  tenants: any[] = [];
  totalRecords = 0;
  rowsPerPage = 10;
  currentPage = 1;
  totalPages = 1;
  rowsPerPageOptions = [10, 25, 50, 100];
  componentName = 'TenantsComponent';

  ngOnInit(): void {
    this.sharedService
      .getBreadcrumbs([
        { label: 'Finance', link: '/dashboard/finance/overview' },
        { label: 'Reports', link: '' },
        { label: 'Ageing / Collections', link: '' },
      ])
      .subscribe((data) => (this.breadcrumbData = data));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.financeService.getAgeingReport().subscribe({
      next: (data) => {
        this.rows = data;
        this.buildSummary(data);
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private buildSummary(data: AgeingRow[]): void {
    const bucketMeta: { bucket: Bucket; label: string; color: string }[] = [
      { bucket: 'Current', label: 'Current', color: 'green' },
      { bucket: '1-30', label: '1–30 Days', color: 'blue' },
      { bucket: '31-60', label: '31–60 Days', color: 'orange' },
      { bucket: '61-90', label: '61–90 Days', color: 'red' },
      { bucket: '90+', label: '90+ Days', color: 'dark' },
    ];
    this.summaryCards = bucketMeta.map((m) => ({
      ...m,
      amount: data
        .filter((r) => r.bucket === m.bucket)
        .reduce((s, r) => s + r.amount, 0),
      count: data.filter((r) => r.bucket === m.bucket).length,
    }));
  }

  applyFilter(): void {
    let r = [...this.rows];
    if (this.activeBucket !== 'All')
      r = r.filter((x) => x.bucket === this.activeBucket);
    const q = this.searchText.toLowerCase().trim();
    if (q)
      r = r.filter(
        (x) =>
          x.tenant.toLowerCase().includes(q) ||
          x.unit.toLowerCase().includes(q) ||
          x.ref.toLowerCase().includes(q),
      );
    this.filtered = r;
  }

  selectBucket(b: Bucket): void {
    this.activeBucket = b;
    this.applyFilter();
  }
  onSearch(v: string): void {
    this.searchText = v;
    this.applyFilter();
  }

  bucketClass(bucket: string): string {
    const map: Record<string, string> = {
      Current: 'ag-bucket-green',
      '1-30': 'ag-bucket-blue',
      '31-60': 'ag-bucket-orange',
      '61-90': 'ag-bucket-red',
      '90+': 'ag-bucket-dark',
    };
    return map[bucket] ?? 'ag-bucket-grey';
  }

  get totalOutstanding(): number {
    return this.filtered.reduce((s, r) => s + r.amount, 0);
  }

  exportCSV(): void {
    const header = 'Tenant,Unit,Ref,Due Date,Amount,Days Overdue,Bucket\n';
    const rows = this.filtered
      .map(
        (r) =>
          `"${r.tenant}",${r.unit},${r.ref},${r.due_date},${r.amount},${r.days_overdue},${r.bucket}`,
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ageing-report.csv';
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
