import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { TableTitleComponent } from '../../../dashboard/component/table-title/table-title.component';
import { BadgeComponent } from '../../component/badge/badge.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { TableFilterButtonComponent } from '../../../dashboard/component/table-filter-btn/table-filter-btn.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { TablePaginationComponent } from '../../../dashboard/component/table-pagination/table-pagination.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { SharedService } from '../../../shared.service';

@Component({
  selector: 'app-documentations',
  standalone: true,
  imports: [
    CommonModule,
    TableTitleComponent,
    BadgeComponent,
    TableSelectComponent,
    CustomSelectComponent,
    TableFilterButtonComponent,
    ExportIconComponent,
    TableActionButtonComponent,
    TablePaginationComponent,
    TranslateModule,
    NoDataComponent,
  ],
  templateUrl: './documentations.component.html',
  styleUrl: './documentations.component.css',
})
export class DocumentationsComponent {
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private sharedService = inject(SharedService);
  currentLanguage = 'en';
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Documentations', link: '' },
  ];

  selected: string = 'Falcom city';

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
