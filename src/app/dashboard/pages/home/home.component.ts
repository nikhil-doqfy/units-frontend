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

  selectedChequesAging: string = 'All';
  selectedPropertiesOwned: string = 'Falcon city of wonders';

  occupancyOptions: any[] = [];
  selectedOccupancy: any = 'All';
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
    this.getStats();
    this.sharedService.initLanguage();
    this.initLanguageListener();
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

  stats: any = {
    total_properties: 0,
    occupied_properties: 0,
    vacant_properties: 0,

    active_leases: 0,
    upcoming_renewals: 0,
    negotiations: 0,
  };

  getStats() {
    this.homeService
      .getDashboardStatistics()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.stats = res.content;
        this.propertyData = res.content.top_properties.map(
          ({ rank, name, occupancy_rate }: any) => ({
            id: rank,
            name,
            value: occupancy_rate,
          })
        );
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

          this.selectedOccupancy = this.occupancyOptions[0];
        },
        error: (err) => console.error(err),
      });
  }

  onOptionSelectedMonthly(option: string) {
    this.selectedMonthly = option;
  }

  onOptionSelectedFilter(option: string) {
    this.selectedFilter = option;
  }

  onOptionSelectedOccupancy(option: string) {
    this.selectedOccupancy = option;
  }

  onOptionSelectedChequesAging(option: string) {
    this.selectedChequesAging = option;
  }

  onOptionSelectedPropertiesOwned(option: string) {
    this.selectedPropertiesOwned = option;
  }

  handleFilterClick(): void {
    console.log('Filter button clicked');
  }
}
