import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { RevenueBarChartComponent } from '../charts/revenue-bar-chart/revenue-bar-chart.component';
import { ArrowComponent } from '../../../shared/component/icons/arrow/arrow.component';
import { CustomSelectComponent } from '../custom-select/custom-select.component';
import { CommonModule } from '@angular/common';
import { TableViewCardComponent } from '../table-view-card/table-view-card.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TableTitleComponent } from '../table-title/table-title.component';
import { TableSearchComponent } from '../table-search/table-search.component';
import { TableFilterButtonComponent } from '../table-filter-btn/table-filter-btn.component';
import { FilterIconComponent } from '../icons/filter-icon/filter-icon.component';
import { ExportIconComponent } from '../icons/export-icon/export-icon.component';
import { TableActionButtonComponent } from '../table-action-btn/table-action-btn.component';
import { TableSelectComponent } from '../table-select/table-select.component';
import { TablePaginationComponent } from '../table-pagination/table-pagination.component';
import { SortingIconComponent } from '../icons/sorting-icon/sorting-icon.component';
import { TableImgItemComponent } from '../table-img-item/table-img-item.component';

@Component({
  selector: 'app-property-analytics',
  standalone: true,
  imports: [
    WhiteCardComponent,
    RevenueBarChartComponent,
    ArrowComponent,
    CustomSelectComponent,
    CommonModule,
    TableViewCardComponent,
    TranslateModule,
    TableTitleComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    FilterIconComponent,
    ExportIconComponent,
    TableSelectComponent,
    TablePaginationComponent,
    CommonModule,
    SortingIconComponent,
    TableImgItemComponent,
  ],
  templateUrl: './property-analytics.component.html',
  styleUrl: './property-analytics.component.css',
})
export class PropertyAnalyticsComponent implements OnInit {
  @Output() detailViewChange = new EventEmitter<boolean>();
  showDetailView: boolean = false;
  leases: any[] = [];
  private translate = inject(TranslateService);
  constructor(private router: Router) {}
  ngOnInit(): void {
    // this.test();
  }
  photos: string[] = [
    '../assets/property/property-comprison1.svg',
    '../assets/property/property-comprison2.svg',
    'assets/property/property-comprison3.svg',
  ];
  activeTab: any = 'properties';

  properties = [
    {
      name: 'Property1',
      image: 'assets/property/property-comprison1.svg',
      revenue: '1,20,573',
      rank: '7th Rank',
      plotArea: '13,000.00',
      builtUpArea: '8,000.00',
      blocks: 24,
      totalUnits: 445,
      occupiedUnits: 200,
      availableUnits: 245,
      parking: 500,
    },
    {
      name: 'Property2',
      image: 'assets/property/property-comprison2.svg',
      revenue: '2,20,573',
      rank: '18th Rank',
      plotArea: '13,000.00',
      builtUpArea: '8,000.00',
      blocks: 24,
      totalUnits: 445,
      occupiedUnits: 200,
      availableUnits: 245,
      parking: 500,
    },
    {
      name: 'Property3',
      image: 'assets/property/property-comprison3.svg',
      revenue: '6,00,736',
      rank: '2nd Rank',
      plotArea: '13,000.00',
      builtUpArea: '8,000.00',
      blocks: 24,
      totalUnits: 445,
      occupiedUnits: 200,
      availableUnits: 245,
      parking: 500,
    },
  ];
  selectedLease: any = null;

  onRentalClick(event: any) {
    console.log('BAR CLICKED', event);
    this.showDetailView = true;
  }
  getLabel(key: string): string {
    return this.translate.instant(key);
  }
  handleEditClick(): void {
    console.log('Edit button clicked');
  }
  showRevenueDetails(): void {
    console.log('Revenue clicked');
    this.activeTab = 'properties';
    this.showDetailView = true;

    this.detailViewChange.emit(false);
    console.log('CHILD showDetailView:', this.showDetailView);
  }
  onRefresh() {}
  handleBackClick(): void {
    this.showDetailView = false;
    this.detailViewChange.emit(true);
    this.router.navigate(['/dashboard/rental']);
  }
  componentName = 'RentalComponent';
  totalRecords = 0;
  rowsPerPageOptions = [10, 25, 50, 100];
  rowsPerPage = 10;
  currentPage = 1;
  handleExportClick(): void {}
  handlePreviewClick() {
    this.router.navigate(['/dashboard/invoice-template']);
  }

  test() {
    this.translate.use('en');
    const englishText = this.translate.instant('TOTAL_REVENUE_RECEIVED');
    console.log('English:', englishText);

    // Arabic
    this.translate.use('ar');
    const arabicText = this.translate.instant('TOTAL_REVENUE_RECEIVED');
    console.log('Arabic:', arabicText);
  }
}
