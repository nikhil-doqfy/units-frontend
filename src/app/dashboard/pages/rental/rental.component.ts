import { Component, DestroyRef, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SharedService } from '../../../shared.service';
import { ThemeService, UserRole } from '../../../theme.service';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { ArrowComponent } from '../../../shared/component/icons/arrow/arrow.component';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { ColumnChartComponent } from '../../component/charts/column/column.component';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TablePaginationComponent } from '../../component/table-pagination/table-pagination.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TableViewCardComponent } from '../../component/table-view-card/table-view-card.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { BreadCrumb } from '../../../shared/model/shared.model';
import { RentalAccountService } from '../../rental-account.service';

@Component({
  selector: 'app-rental',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    WhiteCardComponent,
    ArrowComponent,
    CustomSelectComponent,
    ColumnChartComponent,
    TableTitleComponent,
    TableSearchComponent,
    TablePaginationComponent,
    TableSelectComponent,
    TableViewCardComponent,
    TableActionButtonComponent,
    ExportIconComponent,
    FilterIconComponent,
    TableFilterButtonComponent,
  ],
  templateUrl: './rental.component.html',
  styleUrl: './rental.component.css',
})
export class RentalComponent {
  private sharedService = inject(SharedService);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);

  constructor(
    private router: Router,
    private destroyRef: DestroyRef,
    private themeService: ThemeService
  ) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);

    this.sharedService.showDetail$.subscribe((value) => {
      this.showDetailView = value;
    });
  }

  @Input() data: any;
  @Input() selectedMonth: string = 'Nov 2025';

  currentRole: UserRole = 'owner';
  showDetailView: boolean = false;
  currentLanguage = 'en';
  selected: string = 'property:All';
  selectedLease: any = null;
  showMenu = false;

  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Rental', link: '' },
  ];
  componentName = 'RentalComponent';

  totalRecords = 0;
  rowsPerPageOptions = [10, 25, 50, 100];
  rowsPerPage = 10;
  currentPage = 1;

  // leases = [
  //   {
  //     title: 'Abhram | Khaleejia Building | 302',
  //     leaseNo: 'LV-24-0908',
  //     status: 'Active',
  //     tenantNo: '98909897',
  //     from: '28/02/24',
  //     to: '28/02/25',
  //     unitType: 'Residential',
  //     yearRent: '67,000',
  //     otherCharges: '13,000',
  //     vat: '--',
  //     total: '1,00,000',
  //   },
  //   {
  //     title: 'Al Najah | Platinum Tower | 1201',
  //     leaseNo: 'LK-24-1011',
  //     status: 'Inactive',
  //     tenantNo: '87654321',
  //     from: '01/03/24',
  //     to: '28/02/25',
  //     unitType: 'Commercial',
  //     yearRent: '83,000',
  //     otherCharges: '17,000',
  //     vat: '4,000 @ 5%',
  //     total: '1,04,000',
  //   },
  //   {
  //     title: 'Basil | Emerald Heights | 507',
  //     leaseNo: 'LM-24-1112',
  //     status: 'Active',
  //     tenantNo: '23456789',
  //     from: '15/01/24',
  //     to: '14/01/25',
  //     unitType: 'Mixed-Use',
  //     yearRent: '75,000',
  //     otherCharges: '10,000',
  //     vat: '--',
  //     total: '85,000',
  //   },
  //   {
  //     title: 'Zara | Sapphire Tower | 805',
  //     leaseNo: 'LN-24-2022',
  //     status: 'Active',
  //     tenantNo: '12345678',
  //     from: '01/04/24',
  //     to: '31/03/25',
  //     unitType: 'Office',
  //     yearRent: '90,000',
  //     otherCharges: '15,000',
  //     vat: '5,000',
  //     total: '1,10,000',
  //   },
  // ];
  chequeStatusList = [
    { status: 'Credited', amount: 9000 },
    { status: 'InProgress', amount: 9000 },
    { status: 'Bounce', amount: 9000 },
  ];

  otherChargesList = [
    { label: 'Admin Fee', base: 32.71, vat: 1.64, total: 34.35 },
    { label: 'Ejari Charge Disb...', base: 175.65, vat: 1.64, total: 175.65 },
    { label: 'Gas Charges', base: 1000.0, vat: 50.0, total: 1050.0 },
    { label: 'Commission - Dubai', base: 1200.0, vat: 60.0, total: 1260.0 },
    { label: 'Security Deposit', base: 2400.0, vat: 0.0, total: 2400.0 },
  ];

  summaryData = [
    {
      title: 'Total Amount Received',
      amount: 'AED 1,20,573',
      badge: '12% ↑ last month',
      badgeType: 'success',
    },
    {
      title: 'Cheques Approved',
      amount: 'AED 2,20,789',
      badge: '5678 Cheques',
      badgeType: 'success',
    },
    {
      title: 'Cheques Deposited',
      amount: 'AED 20,573',
      badge: '1124 Cheques',
      badgeType: 'warning',
    },
  ];

  chartData = [
    380000, 350000, 310000, 380000, 300000, 350000, 370000, 420000, 280000,
    340000, 410000, 230000,
  ];

  // ngOnInit() {
  //   this.loadBreadcrumb();

  //   this.translate.onLangChange
  //     .pipe(takeUntilDestroyed(this.destroyRef))
  //     .subscribe(() => this.loadBreadcrumb());

  //   this.themeService.currentRole$
  //     .pipe(takeUntilDestroyed(this.destroyRef))
  //     .subscribe((role) => {
  //       this.currentRole = role;
  //     });
  // }

  // async loadBreadcrumb() {
  //   this.breadcrumbData = await this.sharedService.getBreadcrumbs([
  //     { key: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
  //     { key: 'PAGE_TITLE.RENTAL', link: '' },
  //   ]);

  //   this.sharedService.initLanguage();

  //   this.themeService.currentRole$
  //     .pipe(takeUntilDestroyed(this.destroyRef))
  //     .subscribe((role) => {
  //       this.currentRole = role;
  //     });
  // }

  ngOnInit() {
    this.loadBreadcrumb();
    this.initCurrentRoleListener();
    this.sharedService.initLanguage();
    this.initLanguageListener();
    this.getLeases();
  }

  initCurrentRoleListener() {
    this.themeService.currentRole$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((role) => {
        this.currentRole = role;
      });
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
      { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
      { label: 'PAGE_TITLE.RENTAL', link: '' },
    ]);
  }

  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }
  private rentalAccountService = inject(RentalAccountService);

  leases: any[] = [];

  getLeases() {
    const params = {
      page: this.currentPage,
      limit: this.rowsPerPage,
      // search: this.searchText || '',
    };

    this.rentalAccountService.getOwnerRentAmounts(params).subscribe({
      next: (res) => {
        this.leases = res.content.map((item: any) => ({
          title: `${item.property_name} - ${item.room_no}`,
          leaseNo: item.lease_no,
          status: item.lease_status,
          tenantNo: item.tenant_no ?? '-',
          // from: this.formatDate(item.period_from),
          // to: this.formatDate(item.period_to),
          unitType: item.unit_type,
          yearRent: item.year_rent,
          otherCharges: item.other_charges,
          vat: item.vat,
          total: item.total_rent,
        }));

        this.totalRecords = res.total_records ?? this.leases.length;
      },
    });
  }

  onLeaseClick(lease: any) {
    this.selectedLease = lease;
    this.showDetailView = true;
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }
  toAddRenatlAcc() {
    this.router.navigate(['/dashboard/add-rentalaccount']);
  }

  onMonthChange(month: string) {
    this.selectedMonth = month;
  }

  onOptionSelected(option: string) {
    this.selected = option;
  }

  searchTextChange(event: string) {
    throw new Error('Method not implemented.');
  }
  handleEditClick(): void {
    console.log('Edit button clicked');
  }

  handleExportClick(): void {}

  handleBackClick(): void {
    this.showDetailView = false;
    this.router.navigate(['/dashboard/rental']);
  }

  onRefresh() {
    throw new Error('Method not implemented.');
  }
  handleDownloadDocumentClick(): void {
    console.log('Download Document button clicked');
  }

  handlePreviewDocumentClick(): void {
    console.log('Preview Document button clicked');
  }
}
