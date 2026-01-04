import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef,
  DestroyRef,
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
import { DateIconComponent } from '../../component/icons/date-icon/date-icon.component';
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
import { Subject, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreadCrumb } from '../../../shared/model/shared.model';
import { SharedApiService } from '../../../shared/services/shared-api.service';

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
    DateIconComponent,
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
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
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

  selectedProperty: any = null;
  selectedUnit: any = null;

  monthlyRevenue: any[] = [];
  totalRevenue = 0;
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
  breadcrumbData = [
    { label: this.translate.instant('PAGE_TITLE.DASHBOARD'), link: '' },
  ];
  constructor(private cd: ChangeDetectorRef) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
  }

  ngOnInit(): void {
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

  initLanguageListener() {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.sharedService.initLanguage();
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

  monthlyData: any[] = [];

  loadPayments() {
    this.homeService.getOtherTypePayments().subscribe((res) => {
      this.monthlyData = res.content.monthly_data;
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
      property && property.key !== 'ALL'
        ? { property_unit_id: property.key }
        : {};
    this.homeService
      .getChequeAging(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => (this.chequeData = res?.content),
        error: (err) => console.error(err),
      });
  }

  // onPropertySelected(option: any) {
  //   this.selectedProperty = option;
  //   this.loadChequeAging(option);
  // }

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
    this.selectedFilter = property;
    this.selectedUnit = null;
    this.units = [];

    if (!property?.id) this.getUnitsByProperty(property.id);
  }

  getUnitsByProperty(option: any) {
    this.sharedApiService
      .getOptions({
        option_type: 'PROPERTY_UNIT_BY_LEASE',
        parent_property_id: option?.key,
      })
      .subscribe({
        next: (res) => {
          this.units = res?.content.property_with_lease || [];
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
  onSelectClickPropertyUnit() {
    this.getOptionTypes(['PARENT_PROPERTY_WITH_LEASE']);
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
        this.propertyData = res.content.top_properties.map(
          ({ rank, name, occupancy_rate }: any) => ({
            id: rank,
            name,
            value: occupancy_rate,
          })
        );
      });
  }

  getMonthlyRevenue() {
    this.homeService
      .getMonthlyRevenue()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res?.content;
          this.totalRevenue = res?.total_revenue ?? 0;
          this.mrr = res?.MRR ?? 0;

          this.monthlyRevenue = data?.monthly_revenue.map((item: any) => ({
            name: item.month_str,
            value: item.amount,
          }));
        },
        error: (err) => console.error(err),
      });
  }

  chequeList: any[] = [];

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

          // this.selectedOccupancy = this.occupancyOptions[0];
        },
        error: (err) => console.error(err),
      });
  }

  loadDueGraph() {
    this.homeService.getDashboardGraphDue().subscribe((res) => {
      this.monthlyData = res.content;

      this.monthlyData = (res.content?.monthly_data || []).map((m: any) => ({
        monthName: m.month_name,
        totalAmount: m.total_amount,
        receivedAmount: m.received_amount,
        dueAmount: m.due_amount,
      }));
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
    //  this.selectedProperty = option;
    this.loadChequeAging(option);
  }

  onOptionSelectedPropertiesOwned(option: string) {
    this.selectedPropertiesOwned = option;
  }

  handleFilterClick(): void {
    console.log('Filter button clicked');
  }
}
