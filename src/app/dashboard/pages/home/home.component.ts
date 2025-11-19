import { Component, inject } from '@angular/core';
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
import { ProgressBarTableComponent } from '../../component/progress-bar-table/progress-bar-table.component';
import { ChequeStatusComponent } from '../../component/charts/cheque-status/cheque-status.component';
import { DonutChartComponent } from '../../component/charts/donut/donut.component';
import { LineChartComponent } from '../../component/charts/line/line.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedService } from '../../../shared.service';
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
export class HomeComponent {
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  breadcrumbData = [{ label: 'Dashboard', link: '' }];

  model: NgbDateStruct | null = null;

  constructor() {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
  }

  propertyData = [
    { id: '01', name: 'Dubai Hills Golf Club', value: 45 },
    { id: '02', name: 'Silicon Central Mall', value: 29 },
    { id: '03', name: 'Falconcity', value: 18 },
    { id: '04', name: 'Majan', value: 25 },
  ];

  selectedMonthly: string = 'Oct 2025';
  selectedFilter: string = '';

  selectedOccupancy: string = 'Falcon city of wonders';
  selectedChequesAging: string = 'All';
  selectedPropertiesOwned: string = 'Falcon city of wonders';

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
