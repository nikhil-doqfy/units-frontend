import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FinanceService,
  FinanceOverviewStats,
} from '../../../finance/finance.service';
import { SharedService } from '../../../shared.service';
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../shared/model/shared.model';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TablePaginationComponent } from '../../component/table-pagination/table-pagination.component';

@Component({
  selector: 'app-finance-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NoDataComponent,
    TableSelectComponent,
    TablePaginationComponent,
  ],
  templateUrl: './finance-overview.component.html',
  styleUrl: './finance-overview.component.css',
})
export class FinanceOverviewComponent implements OnInit {
  private financeService = inject(FinanceService);
  private sharedService = inject(SharedService);

  breadcrumbData: BreadCrumb[] = [];
  stats: FinanceOverviewStats | null = null;
  loading = true;

  tenants: any[] = [];
  totalRecords = 0;
  rowsPerPage = 10;
  currentPage = 1;
  totalPages = 1;
  rowsPerPageOptions = [10, 25, 50, 100];
  componentName = 'financeOverviewComponent';

  statCards: {
    label: string;
    value: string;
    sub: string;
    icon: string;
    color: string;
  }[] = [];

  ngOnInit(): void {
    this.sharedService
      .getBreadcrumbs([
        { label: 'Finance', link: '/dashboard/finance/overview' },
        { label: 'Overview', link: '' },
      ])
      .subscribe((data) => (this.breadcrumbData = data));

    this.financeService.getOverviewStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.buildCards(data);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private buildCards(d: FinanceOverviewStats): void {
    this.statCards = [
      {
        label: 'Cash on Hand',
        value: 'AED ' + this.fmt(d.cash_on_hand),
        sub: 'Bank accounts balance',
        icon: 'cash',
        color: 'green',
      },
      {
        label: 'Total AR Outstanding',
        value: 'AED ' + this.fmt(d.total_ar_outstanding),
        sub: 'Across all active leases',
        icon: 'ar',
        color: 'orange',
      },
      {
        label: "This Month's Net P&L",
        value: 'AED ' + this.fmt(d.net_pl_this_month),
        sub: 'Sep 2026',
        icon: 'pl',
        color: 'blue',
      },
      {
        label: 'Cheques Due This Week',
        value: String(d.cheques_due_this_week),
        sub: 'Pending presentation',
        icon: 'cheque',
        color: 'purple',
      },
    ];
  }

  private fmt(n: number): string {
    return new Intl.NumberFormat('en-AE', { minimumFractionDigits: 0 }).format(
      n,
    );
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
