import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService, UserRole } from '../../../theme.service';

import { PlusIconComponent } from "../../../shared/component/icons/plus-icon/plus-icon.component";
import { TableTitleComponent } from "../../../dashboard/component/table-title/table-title.component";
import { TableImgItemComponent } from "../../component/table-img-item/table-img-item.component";
import { BadgeComponent } from '../../component/badge/badge.component';
import { TableSelectComponent } from "../../component/table-select/table-select.component";
import { TableSearchComponent } from "../../component/table-search/table-search.component";
import { TableFilterButtonComponent } from "../../../dashboard/component/table-filter-btn/table-filter-btn.component";
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { ExportIconComponent } from "../../component/icons/export-icon/export-icon.component";
import { TableActionButtonComponent } from "../../component/table-action-btn/table-action-btn.component";
import { TablePaginationComponent } from "../../../dashboard/component/table-pagination/table-pagination.component";
import { SortingIconComponent } from "../../component/icons/sorting-icon/sorting-icon.component";
import { DashTitleComponent } from "../../../shared/component/dash-title/dash-title.component";

@Component({
  selector: 'app-lease-tenancy',
  standalone: true,
  imports: [CommonModule, PlusIconComponent, TableTitleComponent, TableImgItemComponent, BadgeComponent, TableSelectComponent, TableSearchComponent, TableFilterButtonComponent, FilterIconComponent, ExportIconComponent, TableActionButtonComponent, TablePaginationComponent, SortingIconComponent, DashTitleComponent],
  templateUrl: './lease-tenancy.component.html',
  styleUrl: './lease-tenancy.component.css'
})
export class LeaseTenancyComponent {
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Lease', link: '' },
  ];

  currentRole: UserRole = 'owner';

  constructor(
    private router: Router,
    private themeService: ThemeService
  ) { }

  ngOnInit() {
    this.themeService.currentRole$.subscribe(role => {
      this.currentRole = role;
    });
  }

  goToAddLease(): void {
    this.router.navigate(['/dashboard/add-lease']);
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
