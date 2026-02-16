import { Component } from '@angular/core';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { SearchIconComponent } from '../../../shared/component/icons/search-icon/search-icon.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TablePaginationComponent } from '../../component/table-pagination/table-pagination.component';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';

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
  ],
  templateUrl: './cheques.component.html',
  styleUrl: './cheques.component.css',
})
export class ChequesComponent {
  showDetailView: boolean = false;
  activeSummary = 'total';
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

  displayedColumns: string[] = [
    'slNo',
    'unitId',
    'property',
    'block',
    'unit',
    'tenant',
    'cheque',
    'reference',
    'amount',
  ];

  tableData: any[] = [];

  ngOnInit() {
    this.loadTableBySummary('total');
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
  onSummaryClick(key: string) {
    this.activeSummary = key;
    this.loadTableBySummary(key);
  }

  loadTableBySummary(type: string) {
    switch (type) {
      case 'credited':
        this.displayedColumns = [
          'slNo',
          'unitId',
          'tenant',
          'cheque',
          'amount',
          'creditedDate',
        ];
        break;

      case 'realized':
        this.displayedColumns = [
          'slNo',
          'unitId',
          'tenant',
          'cheque',
          'amount',
          'realizedDate',
        ];
        break;

      case 'bounce':
        this.displayedColumns = [
          'slNo',
          'unitId',
          'tenant',
          'cheque',
          'amount',
          'bounceReason',
        ];
        break;

      case 'balance':
        this.displayedColumns = [
          'slNo',
          'unitId',
          'tenant',
          'cheque',
          'amount',
          'pendingDays',
        ];
        break;

      default:
        this.displayedColumns = [
          'slNo',
          'unitId',
          'property',
          'block',
          'unit',
          'tenant',
          'cheque',
          'reference',
          'amount',
        ];
    }

    this.tableData = this.getDummyData();
  }

  getDummyData() {
    return [
      {
        slNo: 1,
        unitId: 'LP9021',
        property: 'Novatis AG',
        block: 'Tower A',
        unit: '204',
        tenant: 'Jensi',
        cheque: '1234 3335 52426',
        reference: 'REF-29876',
        amount: 'AED 12,000',
        creditedDate: '12 Jan 2025',
        realizedDate: '14 Jan 2025',
        bounceReason: 'Insufficient Balance',
        pendingDays: 12,
      },
      {
        slNo: 2,
        unitId: 'LP8021',
        property: 'Silechi Tower',
        block: 'Tower B',
        unit: '302',
        tenant: 'Richard',
        cheque: '2563 3789 9876',
        reference: 'REF-23456',
        amount: 'AED 10,000',
        creditedDate: '10 Jan 2025',
        realizedDate: '13 Jan 2025',
        bounceReason: 'Signature Mismatch',
        pendingDays: 5,
      },
    ];
  }
}
