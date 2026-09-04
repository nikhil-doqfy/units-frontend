import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService, PLLine } from '../../../../finance/finance.service';
import { WhiteCardComponent } from '../../../../shared/component/white-card/white-card.component';
import { SharedService } from '../../../../shared.service';
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../../shared/model/shared.model';
import { ExportIconComponent } from '../../../component/icons/export-icon/export-icon.component';
import { TableFilterButtonComponent } from '../../../component/table-filter-btn/table-filter-btn.component';
import { TableSearchComponent } from '../../../component/table-search/table-search.component';
import { TranslateModule } from '@ngx-translate/core';
import { TableSelectComponent } from '../../../component/table-select/table-select.component';
import { TablePaginationComponent } from '../../../component/table-pagination/table-pagination.component';
import { TableTitleComponent } from '../../../component/table-title/table-title.component';

@Component({
  selector: 'app-profit-loss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    WhiteCardComponent,
    ExportIconComponent,
    TableFilterButtonComponent,
    TranslateModule,
    TableSearchComponent,
    TableSelectComponent,
    TablePaginationComponent,
    TableTitleComponent,
  ],
  templateUrl: './profit-loss.component.html',
  styleUrl: './profit-loss.component.css',
})
export class ProfitLossComponent implements OnInit {
  private financeService = inject(FinanceService);
  private sharedService = inject(SharedService);

  breadcrumbData: BreadCrumb[] = [];
  incomeLines: PLLine[] = [];
  expenseLines: PLLine[] = [];
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

  get totalIncome(): number {
    return this.incomeLines.reduce((s, r) => s + r.amount, 0);
  }
  get totalExpense(): number {
    return this.expenseLines.reduce((s, r) => s + r.amount, 0);
  }
  get netPL(): number {
    return this.totalIncome - this.totalExpense;
  }
  get isProfit(): boolean {
    return this.netPL >= 0;
  }

  ngOnInit(): void {
    this.sharedService
      .getBreadcrumbs([
        { label: 'Finance', link: '/dashboard/finance/overview' },
        { label: 'Reports', link: '' },
        { label: 'Profit & Loss', link: '' },
      ])
      .subscribe((data) => (this.breadcrumbData = data));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.financeService.getProfitAndLoss().subscribe({
      next: (data) => {
        this.incomeLines = data.filter((r) => r.section === 'income');
        this.expenseLines = data.filter((r) => r.section === 'expense');
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
      ...this.incomeLines.map(
        (r) => `Income,${r.account_code},"${r.account_name}",${r.amount}`,
      ),
      `Income,,TOTAL INCOME,${this.totalIncome}`,
      ...this.expenseLines.map(
        (r) => `Expense,${r.account_code},"${r.account_name}",${r.amount}`,
      ),
      `Expense,,TOTAL EXPENSE,${this.totalExpense}`,
      `,,NET P&L,${this.netPL}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `profit-loss-${this.selectedPeriod.replace(' ', '-')}.csv`;
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
