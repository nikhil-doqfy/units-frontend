import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  OnInit,
  Output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { TableSelectComponent } from '../table-select/table-select.component';
import { TablePaginationComponent } from '../table-pagination/table-pagination.component';
import { SortingIconComponent } from '../icons/sorting-icon/sorting-icon.component';
import { TableImgItemComponent } from '../table-img-item/table-img-item.component';
import { LeaseService } from '../../services/lease.service';
import { PropertyService } from '../../services/property.service';

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

  private leaseService    = inject(LeaseService);
  private propertyService = inject(PropertyService);
  private destroyRef      = inject(DestroyRef);
  private translate       = inject(TranslateService);

  showDetailView = false;
  leases: any[] = [];
  activeTab: any = 'properties';
  selectedLease: any = null;
  componentName = 'RentalComponent';
  totalRecords = 0;
  rowsPerPageOptions = [10, 25, 50, 100];
  rowsPerPage = 10;
  currentPage = 1;

  // ── Filters ───────────────────────────────────────────────────────────────
  selectedYear       = String(new Date().getFullYear());
  selectedYearOption = { key: String(new Date().getFullYear()), value: String(new Date().getFullYear()) };
  yearOptions        = Array.from({ length: 6 }, (_, i) => {
    const y = String(new Date().getFullYear() - i);
    return { key: y, value: y };
  });

  propertyOptions: { key: string; value: string }[] = [];
  blockOptions:    { key: string; value: string }[] = [];

  selectedProperty: any = null;
  selectedBlock:    any = null;

  selectedPropertyId = '';
  selectedBlockId    = '';

  // ── Chart ─────────────────────────────────────────────────────────────────
  chartData:    { name: string; value: number }[] = [];
  xAxisTitle    = 'Property';
  totalRevenue  = 0;
  totalRevenueDisplay = '—';

  photos: string[] = [
    '../assets/property/property-comprison1.svg',
    '../assets/property/property-comprison2.svg',
    'assets/property/property-comprison3.svg',
  ];

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

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadPropertyOptions();
    this.loadAnalytics();
  }

  loadPropertyOptions() {
    this.propertyService.getProperties({ page: 1, page_size: 200 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.propertyOptions = (resp?.content || []).map((p: any) => ({
            key: String(p.id), value: p.property_name,
          }));
        },
      });
  }

  loadAnalytics() {
    const params: Record<string, any> = { year: this.selectedYear };
    if (this.selectedBlockId)    params['block_id']    = this.selectedBlockId;
    else if (this.selectedPropertyId) params['property_id'] = this.selectedPropertyId;

    this.leaseService.getPropertyAnalytics(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          const content = resp?.content;
          if (!content) return;
          this.totalRevenue = content.total_revenue ?? 0;
          this.totalRevenueDisplay = `AED ${this.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
          this.chartData = (content.chart ?? []).map((item: any) => ({
            name: item.name,
            value: item.revenue,
          }));
          this.xAxisTitle = content.level === 'unit' ? 'Unit'
                          : content.level === 'block' ? 'Block / Tower'
                          : 'Property';
        },
      });
  }

  onYearSelected(option: any) {
    this.selectedYearOption = option;
    this.selectedYear       = option?.key ?? String(new Date().getFullYear());
    this.loadAnalytics();
  }

  onPropertySelected(option: any) {
    this.selectedProperty   = option ?? null;
    this.selectedBlock      = null;
    this.selectedPropertyId = option?.key ?? '';
    this.selectedBlockId    = '';
    this.blockOptions       = [];

    this.loadAnalytics();

    if (this.selectedPropertyId) {
      this.propertyService.getPropertyBlocks({ property_id: this.selectedPropertyId })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resp: any) => {
            this.blockOptions = (resp?.content || []).map((b: any) => ({
              key: String(b.id), value: b.block_name,
            }));
          },
        });
    }
  }

  onBlockSelected(option: any) {
    this.selectedBlock   = option ?? null;
    this.selectedBlockId = option?.key ?? '';
    this.loadAnalytics();
  }

  getLabel(key: string): string {
    return this.translate.instant(key);
  }

  handleEditClick(): void {}

  showRevenueDetails(): void {
    this.activeTab = 'properties';
    this.showDetailView = true;
    this.detailViewChange.emit(false);
  }

  onRefresh() {}

  handleBackClick(): void {
    this.showDetailView = false;
    this.detailViewChange.emit(true);
    this.router.navigate(['/dashboard/rental']);
  }

  handleExportClick(): void {}

  handlePreviewClick() {
    this.router.navigate(['/dashboard/invoice-template']);
  }
}
