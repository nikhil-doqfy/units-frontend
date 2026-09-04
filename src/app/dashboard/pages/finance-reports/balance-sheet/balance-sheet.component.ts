import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService, BSLine } from '../../../../finance/finance.service';
import { SharedService } from '../../../../shared.service';
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../../shared/model/shared.model';
import { TableSearchComponent } from '../../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../../component/table-filter-btn/table-filter-btn.component';
import { ExportIconComponent } from '../../../component/icons/export-icon/export-icon.component';
import { TableTitleComponent } from '../../../component/table-title/table-title.component';
import { TableSelectComponent } from '../../../component/table-select/table-select.component';
import { TablePaginationComponent } from '../../../component/table-pagination/table-pagination.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-balance-sheet',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableSearchComponent,
    TableFilterButtonComponent,
    ExportIconComponent,
    TableTitleComponent,
    TableSelectComponent,
    TablePaginationComponent,
    TranslateModule,
  ],
  templateUrl: './balance-sheet.component.html',
  styleUrl: './balance-sheet.component.css',
})
export class BalanceSheetComponent implements OnInit {
  private financeService = inject(FinanceService);
  private sharedService = inject(SharedService);

  breadcrumbData: BreadCrumb[] = [];
  assetLines: BSLine[] = [];
  liabilityLines: BSLine[] = [];
  equityLines: BSLine[] = [];
  loading = true;

  tenants: any[] = [];
  totalRecords = 0;
  rowsPerPage = 10;
  currentPage = 1;
  totalPages = 1;
  rowsPerPageOptions = [10, 25, 50, 100];
  componentName = 'financeOverviewComponent';

  selectedPeriod = 'Sep 2026';
  periods = ['Sep 2026', 'Aug 2026', 'Jul 2026', 'Q3 2026', 'FY 2026'];

  get totalAssets(): number {
    return this.assetLines.reduce((s, r) => s + r.amount, 0);
  }
  get totalLiabilities(): number {
    return this.liabilityLines.reduce((s, r) => s + r.amount, 0);
  }
  get totalEquity(): number {
    return this.equityLines.reduce((s, r) => s + r.amount, 0);
  }
  get totalLiabEquity(): number {
    return this.totalLiabilities + this.totalEquity;
  }
  get isBalanced(): boolean {
    return Math.abs(this.totalAssets - this.totalLiabEquity) < 0.01;
  }

  ngOnInit(): void {
    this.sharedService
      .getBreadcrumbs([
        { label: 'Finance', link: '/dashboard/finance/overview' },
        { label: 'Reports', link: '' },
        { label: 'Balance Sheet', link: '' },
      ])
      .subscribe((data) => (this.breadcrumbData = data));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.financeService.getBalanceSheet().subscribe({
      next: (data) => {
        this.assetLines = data.filter((r) => r.section === 'asset');
        this.liabilityLines = data.filter((r) => r.section === 'liability');
        this.equityLines = data.filter((r) => r.section === 'equity');
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  exportCSV(): void {
    const lines = [
      'Section,Account Code,Account Name,Amount',
      ...this.assetLines.map(
        (r) => `Asset,${r.account_code},"${r.account_name}",${r.amount}`,
      ),
      `Asset,,TOTAL ASSETS,${this.totalAssets}`,
      ...this.liabilityLines.map(
        (r) => `Liability,${r.account_code},"${r.account_name}",${r.amount}`,
      ),
      `Liability,,TOTAL LIABILITIES,${this.totalLiabilities}`,
      ...this.equityLines.map(
        (r) => `Equity,${r.account_code},"${r.account_name}",${r.amount}`,
      ),
      `Equity,,TOTAL EQUITY,${this.totalEquity}`,
      `,,TOTAL LIABILITIES + EQUITY,${this.totalLiabEquity}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `balance-sheet-${this.selectedPeriod.replace(' ', '-')}.csv`;
    a.click();
  }
  onRefresh() {}

  searchTextChange(text: string) {}

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
