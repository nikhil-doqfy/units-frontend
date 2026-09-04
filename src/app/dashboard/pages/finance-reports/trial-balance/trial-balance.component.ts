import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FinanceService,
  TrialBalanceLine,
} from '../../../../finance/finance.service';
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
import { NoDataComponent } from "../../../../no-data/no-data.component";

@Component({
  selector: 'app-trial-balance',
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
    NoDataComponent
],
  templateUrl: './trial-balance.component.html',
  styleUrl: './trial-balance.component.css',
})
export class TrialBalanceComponent implements OnInit {
  private financeService = inject(FinanceService);
  private sharedService = inject(SharedService);

  breadcrumbData: BreadCrumb[] = [];
  rows: TrialBalanceLine[] = [];
  filtered: TrialBalanceLine[] = [];
  loading = true;

  tenants: any[] = [];
  totalRecords = 0;
  rowsPerPage = 10;
  currentPage = 1;
  totalPages = 1;
  rowsPerPageOptions = [10, 25, 50, 100];
  componentName = 'financeOverviewComponent';

  searchText = '';
  selectedPeriod = 'Sep 2026';
  periods = ['Sep 2026', 'Aug 2026', 'Jul 2026', 'Jun 2026'];

  get totalDebit(): number {
    return this.filtered.reduce((s, r) => s + r.debit, 0);
  }
  get totalCredit(): number {
    return this.filtered.reduce((s, r) => s + r.credit, 0);
  }
  get isBalanced(): boolean {
    return Math.abs(this.totalDebit - this.totalCredit) < 0.01;
  }

  ngOnInit(): void {
    this.sharedService
      .getBreadcrumbs([
        { label: 'Finance', link: '/dashboard/finance/overview' },
        { label: 'Reports', link: '' },
        { label: 'Trial Balance', link: '' },
      ])
      .subscribe((data) => (this.breadcrumbData = data));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.financeService.getTrialBalance().subscribe({
      next: (data) => {
        this.rows = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  applyFilter(): void {
    const q = this.searchText.toLowerCase().trim();
    this.filtered = q
      ? this.rows.filter(
          (r) =>
            r.account_code.toLowerCase().includes(q) ||
            r.account_name.toLowerCase().includes(q) ||
            r.type.toLowerCase().includes(q),
        )
      : [...this.rows];
  }

  onSearch(v: string): void {
    this.searchText = v;
    this.applyFilter();
  }
  onPeriodChange(): void {
    this.load();
  }
  onRefresh() {}

  typeClass(type: string): string {
    const map: Record<string, string> = {
      Asset: 'fr-badge-blue',
      Income: 'fr-badge-green',
      Liability: 'fr-badge-orange',
      Equity: 'fr-badge-purple',
      Expense: 'fr-badge-red',
    };
    return map[type] ?? 'fr-badge-grey';
  }

  exportCSV(): void {
    const header = 'Account Code,Account Name,Type,Debit,Credit\n';
    const rows = this.filtered
      .map(
        (r) =>
          `${r.account_code},"${r.account_name}",${r.type},${r.debit},${r.credit}`,
      )
      .join('\n');
    const total = `,,TOTAL,${this.totalDebit},${this.totalCredit}`;
    const blob = new Blob([header + rows + '\n' + total], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `trial-balance-${this.selectedPeriod.replace(' ', '-')}.csv`;
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
