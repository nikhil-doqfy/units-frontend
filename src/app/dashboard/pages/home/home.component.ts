import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef,
  DestroyRef,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { StatsCardComponent } from '../../component/stats-card/stats-card.component';
import { GraphStatsIconComponent } from '../../component/icons/graph-stats-icon/graph-stats-icon.component';
import { PropertyStatsIconComponent } from '../../component/icons/property-stats-icon/property-stats-icon.component';
import { TenantStatsIconComponent } from '../../component/icons/tenant-stats-icon/tenant-stats-icon.component';
import { FilterPopupButtonComponent } from '../../component/filter-popup-btn/filter-popup-btn.component';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { BadgeComponent } from '../../component/badge/badge.component';
import { ColumnChartComponent } from '../../component/charts/column/column.component';
import { StackedColumnChartComponent } from '../../component/charts/stacked-column/stacked-column.component';
import { GroupBarChartComponent } from '../../component/charts/group-bar/group-bar.component';
import {
  ProgressBarTableComponent,
  ProgressRow,
} from '../../component/progress-bar-table/progress-bar-table.component';
import { ChequeStatusComponent } from '../../component/charts/cheque-status/cheque-status.component';
import { DonutChartComponent } from '../../component/charts/donut/donut.component';
import { LineChartComponent } from '../../component/charts/line/line.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../shared.service';
import { HomeService } from '../../services/home.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreadCrumb } from '../../../shared/model/shared.model';
import { SharedApiService } from '../../../shared/services/shared-api.service';
import { NoDataComponent } from '../../../no-data/no-data.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    WhiteCardComponent,
    StatsCardComponent,
    GraphStatsIconComponent,
    PropertyStatsIconComponent,
    TenantStatsIconComponent,
    FilterPopupButtonComponent,
    NgbDatepickerModule,
    CustomSelectComponent,
    TableTitleComponent,
    BadgeComponent,
    ColumnChartComponent,
    StackedColumnChartComponent,
    GroupBarChartComponent,
    ProgressBarTableComponent,
    ChequeStatusComponent,
    DonutChartComponent,
    LineChartComponent,
    TranslateModule,
    NoDataComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('chequesAgingGraph', { read: ElementRef })
  chequesAgingGraph!: ElementRef;
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  private homeService = inject(HomeService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);
  private sharedApiService = inject(SharedApiService);
  selectedMonthly: string = 'Oct 2025';
  selectedFilter: string = '';
  occupiedPercent = 0;
  vacantPercent = 0;
  selectedChequesAging: string = 'All';
  selectedPropertiesOwned: string = 'Falcon city of wonders';
  properties: any[] = [];
  units: any[] = [];
  selectedPeriodType: 'month' | 'last6' | 'year' = 'month';
  chequeList: any[] = [];
  selectedProperty: any = null;
  selectedUnit: any = null;

  monthlyRevenue: any[] = [];
  totalRevenue = 0;
  totalAmount = 0;
  duesOverall = { total_amount: 0, received_amount: 0, due_amount: 0 };
  mrr = 0;
  occupancyOptions: any[] = [];
  selectedOccupancy: any = {
    key: 'ALL',
    value: 'All',
  };
  chequeData: any = null;
  propertyData: ProgressRow[] = [];
  model: NgbDateStruct | null = null;
  currentLanguage = 'en';
  monthlyData: any[] = [];
  duesData: any[] = [];
  unitsWithLease: any[] = [];
  selectedYear: number | null = null;

  // Dues filter — separate state so it doesn't share with Revenue/Payment filters
  duesSelectedProperty: any = null;
  duesSelectedUnit: any = null;
  duesUnits: any[] = [];
  duesSelectedYear: number | null = null;

  // Cheques Visibility filter — separate state
  chequeVisSelectedProperty: any = null;
  chequeVisSelectedUnit: any = null;
  chequeVisUnits: any[] = [];
  chequeVisSelectedPeriodType: 'month' | 'last6' | 'year' = 'month';
  chequeVisSelectedMonthly: string = '';
  chequeVisSelectedYear: number | null = null;
  chequeVisSelectedStatus: any = null;

  chequeStatusOptions = [
    { key: '', value: 'All' },
    { key: 'BALANCE', value: 'Balance' },
    { key: 'CREDITED', value: 'Credited' },
    { key: 'REALIZED', value: 'Realized' },
    { key: 'BOUNCED', value: 'Bounced' },
  ];
  breadcrumbData = [
    { label: this.translate.instant('PAGE_TITLE.DASHBOARD'), link: '' },
  ];
  constructor(private cd: ChangeDetectorRef) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
  }

  ngOnInit(): void {
    console.log('monthlyRevenue:', this.monthlyRevenue);

    this.totalRevenue = this.monthlyRevenue.reduce(
      (sum, item) => sum + (item.total_revenue || 0),
      0,
    );
    this.loadBreadcrumb();
    this.sharedService.initLanguage();
    this.initLanguageListener();

    this.getStats();
    this.getMonthlyRevenue();
    this.loadProperties();
    this.loadDueGraph();
    this.getChequeVisibility();
    this.loadPayments();
  }
  changeLanguage(lang: string) {
    this.sharedService.setLanguage(lang);
  }

  // computHeight() {
  //   let height =
  //     this.chequesAgingGraph?.nativeElement?.getBoundingClientRect()?.height;
  //   if (height) return `${height - 8 - 18 - 56 - 2}px`;
  //   else return 0;
  // }

  getTableStyle() {
    const graphHeight = this.chequesAgingGraph?.nativeElement?.offsetHeight;

    if (graphHeight) {
      return {
        'max-height': graphHeight + 'px',
        'overflow-y': 'auto',
      };
    }

    return {};
  }
  initLanguageListener() {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadBreadcrumb();
      });
  }

  loadBreadcrumb() {
    this.setBreadCrumb([
      {
        label: 'PAGE_TITLE.DASHBOARD',
        link: '/dashboard/home',
      },
    ]);
  }

  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }

  paymentTotalRevenue = 0;

  loadPayments(params?: any) {
    this.homeService.getOtherTypePayments(params).subscribe((res) => {
      this.monthlyData = res.content.monthly_data || [];
      this.paymentTotalRevenue = res.content.total_revenue ?? 0;
    });
  }
  stats: any = {
    total_properties: 0,
    occupied_properties: 0,
    vacant_properties: 0,

    active_leases: 0,
    upcoming_renewals: 0,
    negotiations: 0,
  };

  loadProperties() {
    this.sharedApiService
      .getOptions({ option_type: 'PARENT_PROPERTY' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.properties = [
            { key: 'ALL', value: 'All' },
            ...res.content.property,
          ];
          this.loadChequeAging();
        },
        error: (err) => console.error(err),
      });
  }

  loadChequeAging(property?: any) {
    const params =
      property && property.key !== 'ALL' ? { property_id: property.key } : {};
    this.homeService
      .getChequeAging(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => (this.chequeData = res?.content),
        error: (err) => console.error(err),
      });
  }

  getOptionTypes(options: string[]) {
    this.sharedApiService
      .getOptions({ option_type: options.join(',') })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.properties = response?.content?.property_with_lease ?? [];
        },
      });
  }

  onPropertySelected(property: any) {
    this.selectedProperty = property;
    this.selectedFilter = property;
    this.selectedUnit = null;
    this.units = [];

    if (property?.key) this.getUnitsByProperty(property);
  }

  getUnitsByProperty(option: any) {
    this.sharedApiService
      .getOptions({
        option_type: 'PROPERTY_UNIT_BY_LEASE',
        parent_property_id: option?.key,
      })
      .subscribe({
        next: (res) => {
          this.units = res?.content?.property_unit_with_lease || [];
        },
        error: () => {
          this.units = [];
        },
      });
  }

  onOptionSelectedPropertyUnit(option: any) {
    console.log('PROPERTY UNIT FROM SELECT:', option);
    this.selectedProperty = option?.value ?? null;
    this.selectedProperty = option?.key;
  }

  onUnitSelected(unit: any) {
    this.selectedUnit = unit;
    console.log('Selected Unit:', unit);
  }
  getAgingValue(key: string) {
    return this.chequeData?.aging_breakup?.[key] || 0;
  }
  getStats(propertyId?: string) {
    const params = propertyId ? { property_id: propertyId } : {};
    this.homeService
      .getDashboardStatistics(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.stats = res.content;
        this.occupiedPercent =
          res.content?.occupancy_data?.occupied_percent ?? 0;

        this.vacantPercent = res.content?.occupancy_data?.vacant_percent ?? 0;
        this.propertyData = (res.content.top_properties ?? []).map(
          ({ rank, name, occupancy_rate }: any) => ({
            id: rank,
            name,
            value: occupancy_rate,
          }),
        );
      });
  }

  getMonthlyRevenue(params?: any) {
    this.homeService
      .getMonthlyRevenue(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const content = res?.content;

          this.totalRevenue = content?.total_revenue ?? 0;
          this.mrr = content?.MRR ?? 0;

          this.monthlyRevenue = (content?.monthly_revenue || []).map(
            (item: any) => ({
              name: item.month_str,
              value: item.amount,
            }),
          );
        },
        error: (err) => console.error(err),
      });
  }

  getChequeVisibility() {
    this.homeService
      .getChequeVisibility()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.chequeList = res?.content?.cheques || [];
        },
        error: (err) => console.error(err),
      });
  }
  getOccupancyOptions() {
    this.sharedApiService
      .getOptions({ option_type: 'PARENT_PROPERTY' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.occupancyOptions = resp?.content?.property ?? [];
          this.occupancyOptions.unshift({
            key: 'ALL',
            value: 'All',
          });
        },
        error: (err) => console.error(err),
      });
  }

  loadDueGraph(params?: any) {
    this.homeService.getDashboardGraphDue(params).subscribe({
      next: (res) => {
        this.totalAmount = res.content?.overall?.due_amount ?? 0;
        this.duesOverall = {
          total_amount: res.content?.overall?.total_amount ?? 0,
          received_amount: res.content?.overall?.received_amount ?? 0,
          due_amount: res.content?.overall?.due_amount ?? 0,
        };
        this.duesData = (res.content?.monthly_data || []).map((m: any) => ({
          monthName: m.month_str,
          totalAmount: m.total_amount > 0 ? 100 : 0,
          receivedAmount: m.received_percent ?? 0,
          dueAmount: m.due_percent ?? 0,
        }));
      },
      error: (err) => console.error('Dues API error:', err),
    });
  }

  onOptionSelectedMonthly(option: string) {
    this.selectedMonthly = option;
  }

  onOptionSelectedFilter(option: string) {
    this.selectedFilter = option;
  }

  onOptionSelectedOccupancy(option: any) {
    this.selectedOccupancy = option;

    if (option.key === 'ALL') {
      this.getStats();
    } else {
      this.getStats(option.key);
    }
  }

  onOptionSelectedChequesAging(option: string) {
    this.selectedChequesAging = option;
    this.loadChequeAging(option);
  }

  onOptionSelectedPropertiesOwned(option: string) {
    this.selectedPropertiesOwned = option;
  }

  onDuesPropertySelected(property: any) {
    this.duesSelectedProperty = property;
    this.duesSelectedUnit = null;
    this.duesUnits = [];
    if (property?.key && property.key !== 'ALL') {
      this.sharedApiService
        .getOptions({
          option_type: 'PROPERTY_UNIT_BY_LEASE',
          parent_property_id: property.key,
        })
        .subscribe({
          next: (res) => {
            this.duesUnits = res?.content?.property_unit_with_lease || [];
          },
          error: () => {
            this.duesUnits = [];
          },
        });
    }
  }

  onDuesUnitSelected(unit: any) {
    this.duesSelectedUnit = unit;
  }

  handleFilterClick(chartType: 'revenue' | 'dues' | 'payment'): void {
    if (chartType === 'dues') {
      const params: any = {};
      if (this.duesSelectedUnit?.key) {
        params.property_unit_id = this.duesSelectedUnit.key;
      }
      if (this.duesSelectedYear) {
        params.year = this.duesSelectedYear;
      }
      this.loadDueGraph(Object.keys(params).length ? params : undefined);
      this.duesSelectedProperty = null;
      this.duesSelectedUnit = null;
      this.duesSelectedYear = null;
      this.duesUnits = [];
      return;
    }

    const params: any = {};

    if (this.selectedUnit?.key) {
      params.property_unit_id = this.selectedUnit.key;
    }

    if (this.selectedYear) {
      params.year = this.selectedYear;
    }

    if (chartType === 'revenue') {
      this.getMonthlyRevenue(Object.keys(params).length ? params : undefined);
      this.selectedProperty = null;
      this.selectedUnit = null;
      this.selectedYear = null;
      this.units = [];
    } else if (chartType == 'payment') {
      this.loadPayments(Object.keys(params).length ? params : undefined);
      this.selectedProperty = null;
      // this.selectedFilter = null;
      this.selectedUnit = null;
      this.selectedYear = null;
      this.units = [];
    }
  }

  //------------------------------------filter cheques visibility ---------------------------------------------

  selectPeriod(type: 'month' | 'last6' | 'year') {
    this.selectedPeriodType = type;
  }

  getChequeDateRange() {
    let fromDate!: number;
    let toDate!: number;

    const now = new Date();

    if (this.selectedPeriodType === 'month') {
      const [monthStr, yearStr] = this.selectedMonthly.split(' ');
      const year = Number(yearStr);

      const monthMap: any = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };

      const monthIndex = monthMap[monthStr];

      fromDate = new Date(year, monthIndex, 1, 0, 0, 0).getTime();
      toDate = new Date(year, monthIndex + 1, 0, 23, 59, 59).getTime();
    } else if (this.selectedPeriodType === 'last6') {
      toDate = now.getTime();
      fromDate = new Date(
        now.getFullYear(),
        now.getMonth() - 5,
        1,
        0,
        0,
        0,
      ).getTime();
    } else if (this.selectedPeriodType === 'year' && this.selectedYear) {
      fromDate = new Date(this.selectedYear, 0, 1, 0, 0, 0).getTime();
      toDate = new Date(this.selectedYear, 11, 31, 23, 59, 59).getTime();
    }

    return { fromDate, toDate };
  }

  onChequeVisPropertySelected(property: any) {
    this.chequeVisSelectedProperty = property;
    this.chequeVisSelectedUnit = null;
    this.chequeVisUnits = [];
    if (property?.key && property.key !== 'ALL') {
      this.sharedApiService
        .getOptions({
          option_type: 'PROPERTY_UNIT_BY_LEASE',
          parent_property_id: property.key,
        })
        .subscribe({
          next: (res) => {
            this.chequeVisUnits = res?.content?.property_unit_with_lease || [];
          },
          error: () => {
            this.chequeVisUnits = [];
          },
        });
    }
  }

  onChequeVisUnitSelected(unit: any) {
    this.chequeVisSelectedUnit = unit;
  }

  getChequeVisDateRange(): { fromDate: number; toDate: number } {
    const now = new Date();
    let fromDate!: number;
    let toDate!: number;

    if (
      this.chequeVisSelectedPeriodType === 'month' &&
      this.chequeVisSelectedMonthly
    ) {
      // input type="month" returns "YYYY-MM"
      const [yearStr, monthStr] = this.chequeVisSelectedMonthly.split('-');
      const year = Number(yearStr);
      const monthIndex = Number(monthStr) - 1;
      fromDate = new Date(year, monthIndex, 1, 0, 0, 0).getTime();
      toDate = new Date(year, monthIndex + 1, 0, 23, 59, 59).getTime();
    } else if (this.chequeVisSelectedPeriodType === 'last6') {
      toDate = now.getTime();
      fromDate = new Date(
        now.getFullYear(),
        now.getMonth() - 5,
        1,
        0,
        0,
        0,
      ).getTime();
    } else if (
      this.chequeVisSelectedPeriodType === 'year' &&
      this.chequeVisSelectedYear
    ) {
      fromDate = new Date(this.chequeVisSelectedYear, 0, 1, 0, 0, 0).getTime();
      toDate = new Date(
        this.chequeVisSelectedYear,
        11,
        31,
        23,
        59,
        59,
      ).getTime();
    } else {
      // default: current month
      fromDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
        0,
        0,
        0,
      ).getTime();
      toDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
      ).getTime();
    }

    return { fromDate, toDate };
  }

  handleApplyFilter() {
    const { fromDate, toDate } = this.getChequeVisDateRange();

    const params: any = { from_date: fromDate, to_date: toDate };

    if (
      this.chequeVisSelectedProperty?.key &&
      this.chequeVisSelectedProperty.key !== 'ALL'
    ) {
      params.property_id = this.chequeVisSelectedProperty.key;
    }
    if (this.chequeVisSelectedUnit?.key) {
      params.property_unit_id = this.chequeVisSelectedUnit.key;
    }
    if (this.chequeVisSelectedStatus?.key) {
      params.cheque_status = this.chequeVisSelectedStatus.key;
    }

    this.homeService
      .getChequeVisibility(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.chequeList = res?.content?.cheques ?? [];
          this.resetChequeFilter();
        },
        error: () => {
          this.chequeList = [];
        },
      });
  }
  resetChequeFilter() {
    this.chequeVisSelectedProperty = null;
    this.chequeVisSelectedUnit = null;
    this.chequeVisSelectedStatus = null;

    this.chequeVisSelectedPeriodType = 'month';
    this.chequeVisSelectedMonthly = '';
    this.chequeVisSelectedYear = null;

    this.chequeVisUnits = [];
  }
  //---------------------------------------error-------------------------------------------------
  tableMaxHeight: string = 'auto';
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateTableHeight();
    });
  }

  updateTableHeight() {
    const height =
      this.chequesAgingGraph?.nativeElement?.getBoundingClientRect()?.height;

    this.tableMaxHeight = height ? `${height - 4}px` : 'auto';

    this.cd.detectChanges();
  }
}
