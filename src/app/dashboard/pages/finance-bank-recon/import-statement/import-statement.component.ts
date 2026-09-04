import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FinanceService,
  BankStatementLine,
} from '../../../../finance/finance.service';
import { WhiteCardComponent } from '../../../../shared/component/white-card/white-card.component';
import { SharedService } from '../../../../shared.service';
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../../shared/model/shared.model';
import { TablePaginationComponent } from '../../../component/table-pagination/table-pagination.component';
import { TableSelectComponent } from '../../../component/table-select/table-select.component';
import { TableTitleComponent } from '../../../component/table-title/table-title.component';
import { TableSearchComponent } from '../../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../../component/table-filter-btn/table-filter-btn.component';
import { TranslateModule } from '@ngx-translate/core';
import { ExportIconComponent } from '../../../component/icons/export-icon/export-icon.component';
import { FilterIconComponent } from "../../../component/icons/filter-icon/filter-icon.component";

@Component({
  selector: 'app-import-statement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    WhiteCardComponent,
    TablePaginationComponent,
    TableSelectComponent,
    TableTitleComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    TranslateModule,
    ExportIconComponent,
    FilterIconComponent
],
  templateUrl: './import-statement.component.html',
  styleUrl: './import-statement.component.css',
})
export class ImportStatementComponent implements OnInit {
  private financeService = inject(FinanceService);
  private sharedService = inject(SharedService);

  breadcrumbData: BreadCrumb[] = [];
  rows: BankStatementLine[] = [];
  filtered: BankStatementLine[] = [];
  loading = true;
  uploading = false;
  uploadDone = false;

  // ── Table state ──────────────────────────────────
  tenants: any[] = [];
  totalRecords = 0;
  rowsPerPage = 10;
  currentPage = 1;
  totalPages = 1;
  rowsPerPageOptions = [10, 25, 50, 100];
  componentName = 'TenantsComponent';

  searchText = '';
  matchFilter = 'All';
  matchOptions = ['All', 'Matched', 'Unmatched'];

  dragOver = false;
  selectedFile: File | null = null;

  get matchedCount(): number {
    return this.rows.filter((r) => r.matched).length;
  }
  get unmatchedCount(): number {
    return this.rows.filter((r) => !r.matched).length;
  }
  get totalCredit(): number {
    return this.rows
      .filter((r) => r.amount > 0)
      .reduce((s, r) => s + r.amount, 0);
  }
  get totalDebit(): number {
    return Math.abs(
      this.rows.filter((r) => r.amount < 0).reduce((s, r) => s + r.amount, 0),
    );
  }

  ngOnInit(): void {
    this.sharedService
      .getBreadcrumbs([
        { label: 'Finance', link: '/dashboard/finance/overview' },
        { label: 'Bank Reconciliation', link: '' },
        { label: 'Import Statement', link: '' },
      ])
      .subscribe((data) => (this.breadcrumbData = data));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.financeService.getBankStatement().subscribe({
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
    let r = [...this.rows];
    if (this.matchFilter === 'Matched') r = r.filter((x) => x.matched);
    if (this.matchFilter === 'Unmatched') r = r.filter((x) => !x.matched);
    const q = this.searchText.toLowerCase().trim();
    if (q)
      r = r.filter(
        (x) =>
          x.reference.toLowerCase().includes(q) ||
          x.description.toLowerCase().includes(q),
      );
    this.filtered = r;
  }

  onSearch(v: string): void {
    this.searchText = v;
    this.applyFilter();
  }
  onFilterChange(): void {
    this.applyFilter();
  }
  onRefresh() {}

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.dragOver = true;
  }
  onDragLeave(): void {
    this.dragOver = false;
  }
  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragOver = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) this.handleFile(file);
  }
  onFileInput(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.handleFile(file);
  }
  handleFile(file: File): void {
    this.selectedFile = file;
    this.uploading = true;
    // Simulate upload — replace with real API call
    setTimeout(() => {
      this.uploading = false;
      this.uploadDone = true;
      this.load();
    }, 1200);
  }
  clearFile(): void {
    this.selectedFile = null;
    this.uploadDone = false;
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
