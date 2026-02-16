import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, ɵEmptyOutletComponent } from '@angular/router';
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
import { DisableIconComponent } from '../../../icon/disable-icon/disable-icon.component';
import { RefreshIconComponent } from '../../component/icons/refresh-icon/refresh-icon.component';
import { PropertyAnalyticsComponent } from '../../component/property-analytics/property-analytics.component';
import { InvoiceIconComponent } from '../../../icons/invoice-icon/invoice-icon.component';
import { DocumentTypeItemComponent } from '../../component/document-type-item/document-type-item.component';
import { TermsconditionIconComponent } from '../../../icons/termscondition-icon/termscondition-icon.component';
import { BadgeComponent } from '../../component/badge/badge.component';
import { StatusDropdownComponent } from '../../component/status-dropdown/status-dropdown.component';
import { AreaGraphComponent } from '../../component/charts/area-graph/area-graph.component';
import { ReceiptIconComponent } from '../../../icons/receipt-icon/receipt-icon.component';
import { ArrowDownIconComponent } from '../../../shared/component/icons/arrow-down-icon/arrow-down-icon.component';

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
    DisableIconComponent,
    RefreshIconComponent,
    PropertyAnalyticsComponent,
    InvoiceIconComponent,
    DocumentTypeItemComponent,
    TermsconditionIconComponent,
    BadgeComponent,
    StatusDropdownComponent,
    AreaGraphComponent,
    ɵEmptyOutletComponent,
    ReceiptIconComponent,
    ArrowDownIconComponent,
  ],
  templateUrl: './rental.component.html',
  styleUrl: './rental.component.css',
})
export class RentalComponent {
  private sharedService = inject(SharedService);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private rentalAccountService = inject(RentalAccountService);
  showNavBar: boolean = true;

  constructor(
    private router: Router,
    private destroyRef: DestroyRef,
    private themeService: ThemeService,
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
  activeTab: string = 'properties';
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Rental', link: '' },
  ];
  componentName = 'RentalComponent';

  totalRecords = 0;
  rowsPerPageOptions = [10, 25, 50, 100];
  rowsPerPage = 10;
  currentPage = 1;

  chartData = [
    380000, 350000, 310000, 380000, 300000, 350000, 370000, 420000, 280000,
    340000, 410000, 230000,
  ];

  ngOnInit() {
    this.loadBreadcrumb();

    this.sharedService.initLanguage();

    this.initLanguageListener();
    this.initCurrentRoleListener();
    this.sharedService.initLanguage();
    this.initLanguageListener();
    this.getLeases();
  }
  onPropertyDetailToggle(flag: boolean) {
    this.showNavBar = flag;
    // this.showDetailView = flag;
    console.log('flag', flag);
    // this.showDetailView = false;
  }
  getLabel(key: string): string {
    return this.translate.instant(key);
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

  leases: any[] = [];

  totalAmount = 'AED 2,000.00';
  receivedAmount = 'AED 1,200.00';
  pendingAmount = 'AED 800.00';
  getLeases() {
    const params = {
      page: this.currentPage,
      limit: this.rowsPerPage,
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
    this.showInvoiceDetails = false;
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
  handlePreviewClick() {
    this.router.navigate(['/dashboard/invoice-template']);
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

  showInvoiceDetails = false;
  onViewInvoiceClick(lease: any, event: Event) {
    event.preventDefault();
    this.selectedLease = lease;
    this.showInvoiceDetails = true;
    console.log('Invoice Details for:', lease);
  }
  handleDownload(type: string) {
    console.log('Download:', type);
    // API call / file generate logic
  }
  handleShare(type: string) {
    console.log('Share:', type);
  }
  showDropdown = false;

  selectedq: any = {
    label: 'Amount Credited',
    status: 'green',
  };

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  onStatusSelect(item: any) {
    this.selected = item;
    this.showDropdown = false;
  }

  showReceiptDropdown = false;
  showMonthDropdown = false;
  selectedReceiptType = '';

  toggleReceipt() {
    this.showReceiptDropdown = !this.showReceiptDropdown;
    this.showMonthDropdown = false; // first click ला month नको
  }

  selectReceiptType(type: string) {
    this.selectedReceiptType = type;
    this.showMonthDropdown = true; // option click केल्यावर month open
  }
}
