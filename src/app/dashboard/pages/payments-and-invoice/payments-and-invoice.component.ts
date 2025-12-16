import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { PaymentsInfoCardComponent } from '../../component/payments-info-card/payments-info-card.component';
import { TableTitleComponent } from '../../../dashboard/component/table-title/table-title.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../../dashboard/component/table-filter-btn/table-filter-btn.component';
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { TablePaginationComponent } from '../../../dashboard/component/table-pagination/table-pagination.component';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { SharedService } from '../../../shared.service';

@Component({
  selector: 'app-payments-and-invoice',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    WhiteCardComponent,
    PaymentsInfoCardComponent,
    TableTitleComponent,
    TableSelectComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    FilterIconComponent,
    ExportIconComponent,
    TableActionButtonComponent,
    TablePaginationComponent,
    CustomSelectComponent,
    NoDataComponent,
  ],
  templateUrl: './payments-and-invoice.component.html',
  styleUrl: './payments-and-invoice.component.css',
})
export class PaymentsAndInvoiceComponent {
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  private translate = inject(TranslateService);
  selected: string = 'Property Name: All';
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Payments & Invoice', link: '' },
  ];

  overallAmountPaid = 'AED 5,678';
  monthlyRent = 'AED300';
  maintenanceCharges = 'AED12';
  dueTime = '5 Days';
  lastDate = '29/09/2025';
  currentLanguage = 'en';
  constructor(private router: Router) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
  }

  ngOnInit() {
    this.sharedService.initLanguage();
  }
  onOptionSelected(option: string) {
    this.selected = option;
  }

  handleFilterClick(): void {
    console.log('Filter button clicked');
  }

  handleExportClick(): void {
    console.log('Export button clicked');
  }

  handleDownloadClick(): void {
    console.log('Download button clicked');
  }

  handlePreviewClick(): void {
    console.log('Preview button clicked');
  }
}
