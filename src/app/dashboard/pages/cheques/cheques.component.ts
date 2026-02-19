import { Component, DestroyRef, inject } from '@angular/core';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { SearchIconComponent } from '../../../shared/component/icons/search-icon/search-icon.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TablePaginationComponent } from '../../component/table-pagination/table-pagination.component';
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../shared/model/shared.model';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { SharedService } from '../../../shared.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-cheques',
  standalone: true,
  imports: [
    TranslateModule,
    CommonModule,
    WhiteCardComponent,
    CustomSelectComponent,
    SearchIconComponent,
    TableSelectComponent,
    TablePaginationComponent,
    SortingIconComponent,
    TableImgItemComponent,
  ],
  templateUrl: './cheques.component.html',
  styleUrl: './cheques.component.css',
})
export class ChequesComponent {
  showDetailView: boolean = false;
  componentName: string = 'ChequesComponent';
  totalRecords: number = 0;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;

  summaryCards = [
    {
      key: 'total',
      title: 'Total Cheques Received',
      subtitle: 'All cheques recorded',
      amount: '1,248',
      count: 'AED 12,66,827.00',
      color: 'grey',
    },
    {
      key: 'credited',
      title: 'Total Cheques Credited',
      subtitle: 'Based on post-dated cheques',
      amount: 'AED 4,80,000',
      count: '120',
      color: 'purple',
    },
    {
      key: 'realized',
      title: 'Cheques Realized',
      subtitle: 'Successfully credited',
      amount: 'AED 12,45,780',
      count: '700',
      color: 'green',
    },
    {
      key: 'bounce',
      title: 'Cheque Bounce',
      subtitle: 'Requires follow-up',
      amount: 'AED 75,000',
      count: '12',
      color: 'orange',
    },
    {
      key: 'balance',
      title: 'Balance Cheques',
      subtitle: 'Not yet deposited',
      amount: 'AED 75,000',
      count: '12',
      color: 'blue',
    },
  ];

  tableData: any[] = [];
  private destroyRef = inject(DestroyRef);
  private translate = inject(TranslateService);
  ngOnInit() {
    this.loadBreadcrumb();
  }
  private sharedService = inject(SharedService);
  breadcrumbData: BreadCrumb[] = [];

  initLanguageListener() {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadBreadcrumb();
      });
  }
  loadBreadcrumb() {
    if (this.showDetailView) {
      this.setBreadCrumb([
        { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
        { label: 'PAGE_TITLE.PROPERTIES', link: '/dashboard/Cheques' },
        { label: 'PROPERTY_DETAILS', link: '' },
      ]);
    } else {
      this.setBreadCrumb([
        { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
        { label: 'PAGE_TITLE.CHEQUES', link: '' },
      ]);
    }
  }
  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }
  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
  }
  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
  }

  activeSummary: 'total' | 'credited' | 'realized' | 'bounce' | 'balance' =
    'total';

  onSummaryClick(key: any) {
    this.activeSummary = key;
    this.showDetailView = false;
  }

  openDetails(row: any) {
    this.showDetailView = true;
  }

  backToList() {
    this.showDetailView = false;
  }
}
