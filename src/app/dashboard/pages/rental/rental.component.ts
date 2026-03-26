import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ɵEmptyOutletComponent } from '@angular/router';
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
import { BreadCrumb, PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { LeaseService } from '../../services/lease.service';
import { TenantsService } from '../../services/tenants.service';
import { PropertyService } from '../../services/property.service';
import { Subject, debounceTime } from 'rxjs';
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
import { StatusActionDropdownComponent } from '../../../status-action-dropdown/status-action-dropdown.component';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TenantDetailComponent } from '../tenant-detail/tenant-detail.component';

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
    StatusActionDropdownComponent,
    NgbPopoverModule,
    TenantDetailComponent,
  ],
  templateUrl: './rental.component.html',
  styleUrl: './rental.component.css',
})
export class RentalComponent {
  private sharedService = inject(SharedService);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private leaseService         = inject(LeaseService);
  private tenantsService       = inject(TenantsService);
  private propertyService      = inject(PropertyService);
  showNavBar: boolean = true;

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

  // ── Cheque chart & summary ────────────────────────────────────────
  selectedYear = String(new Date().getFullYear());
  yearOptions  = Array.from({ length: 6 }, (_, i) => {
    const y = String(new Date().getFullYear() - i);
    return { key: y, value: y };
  });

  private static readonly MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  chartData: { name: string; value: number }[] = RentalComponent.MONTHS.map(m => ({ name: m, value: 0 }));

  summaryAmountReceived  = '—';
  summaryChequesApproved = '—';
  summaryChequesDeposited = '—';
  summaryCountApproved   = '—';
  summaryCountDeposited  = '—';

  // ── Rent Amounts filters ──────────────────────────────────────────
  rentalPropertyOptions: { key: string; value: string }[] = [];
  rentalBlockOptions:    { key: string; value: string }[] = [];
  rentalUnitOptions:     { key: string; value: string }[] = [];

  rentalFilterPropertyId = '';
  rentalFilterBlockId    = '';
  rentalFilterUnitId     = '';

  private rentalSearchSubject$ = new Subject<string>();
  private rentalSearchText     = '';

  leases: any[] = [
    {
      title: 'Lease Agreement - A Wing',
      leaseNo: 'L-1001',
      status: 'Active',
      tenantNo: 'T-201',
      period_from: '2025-01-01',
      period_to: '2026-01-01',
      unitType: '2 BHK',
      year_rent: '500000',
      other_charges: '20000',
      vat: '5%',
      total_rent: '520000',
    },
  ];
  constructor(
    private destroyRef: DestroyRef,
    private themeService: ThemeService,
  ) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);

    this.sharedService.showDetail$.subscribe((value) => {
      this.showDetailView = value;
    });
  }
  ngOnInit() {
    this.loadBreadcrumb();
    this.sharedService.initLanguage();
    this.initLanguageListener();
    this.initCurrentRoleListener();
    this.sharedService.initLanguage();
    this.initLanguageListener();
    this.loadRentalFilterOptions();
    this.getLeases();
    this.loadChequeSummary();
    this.loadChequeMonthly();
    this.rentalSearchSubject$
      .pipe(debounceTime(400), takeUntilDestroyed(this.destroyRef))
      .subscribe(text => {
        this.rentalSearchText = text.trim();
        this.currentPage = 1;
        this.getLeases();
      });
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

  totalAmount    = 'AED 2,000.00';
  receivedAmount = 'AED 1,200.00';
  pendingAmount  = 'AED 800.00';

  getLeases() {
    const params: Record<string, any> = {
      tab:       'all',
      page:      this.currentPage,
      page_size: this.rowsPerPage,
    };
    if (this.rentalSearchText)      params['search']      = this.rentalSearchText;
    if (this.rentalFilterPropertyId) params['property_id'] = this.rentalFilterPropertyId;
    if (this.rentalFilterBlockId)    params['block_id']    = this.rentalFilterBlockId;
    if (this.rentalFilterUnitId)     params['unit_id']     = this.rentalFilterUnitId;

    this.tenantsService.getTenantsByTab(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.leases       = res?.content ?? [];
          this.totalRecords = res?.pagination?.total_records ?? this.leases.length;
        },
      });
  }

  loadRentalFilterOptions() {
    this.propertyService.getProperties({ page: 1, page_size: 200 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.rentalPropertyOptions = (resp?.content || []).map((p: any) => ({
            key: String(p.id), value: p.property_name,
          }));
        },
      });
  }

  onRentalPropertySelected(option: any) {
    this.rentalFilterPropertyId = option?.key ?? '';
    this.rentalFilterBlockId    = '';
    this.rentalFilterUnitId     = '';
    this.rentalBlockOptions     = [];
    this.rentalUnitOptions      = [];
    this.currentPage            = 1;
    this.getLeases();

    if (this.rentalFilterPropertyId) {
      this.propertyService.getPropertyBlocks({ property_id: this.rentalFilterPropertyId })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resp: any) => {
            this.rentalBlockOptions = (resp?.content || []).map((b: any) => ({
              key: String(b.id), value: b.block_name,
            }));
          },
        });
    }
  }

  onRentalBlockSelected(option: any) {
    this.rentalFilterBlockId = option?.key ?? '';
    this.rentalFilterUnitId  = '';
    this.rentalUnitOptions   = [];
    this.currentPage         = 1;
    this.getLeases();

    if (this.rentalFilterBlockId) {
      this.propertyService.getUnits({ property_block_tower_id: this.rentalFilterBlockId, page: 1, page_size: 200 })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resp: any) => {
            this.rentalUnitOptions = (resp?.content || []).map((u: any) => ({
              key: String(u.id), value: u.unit_name || u.code,
            }));
          },
        });
    }
  }

  onRentalUnitSelected(option: any) {
    this.rentalFilterUnitId = option?.key ?? '';
    this.currentPage        = 1;
    this.getLeases();
  }

  get hasRentalFilter(): boolean {
    return !!(this.rentalFilterPropertyId || this.rentalFilterBlockId || this.rentalFilterUnitId || this.rentalSearchText);
  }

  clearRentalFilters() {
    this.rentalFilterPropertyId = '';
    this.rentalFilterBlockId    = '';
    this.rentalFilterUnitId     = '';
    this.rentalSearchText       = '';
    this.rentalBlockOptions     = [];
    this.rentalUnitOptions      = [];
    this.currentPage            = 1;
    this.getLeases();
  }

  onRentalSearch(text: string) {
    this.rentalSearchSubject$.next(text);
  }

  onRefresh() {
    this.currentPage = 1;
    this.getLeases();
  }

  onPageSizeChange(event: PageSizeChange) {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.getLeases();
  }

  onPageChange(event: PageChange) {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.getLeases();
  }

  loadChequeSummary() {
    this.leaseService.getChequeSummary({ year: this.selectedYear })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          const s = resp?.content;
          if (!s) return;
          const fmt = (n: number) => `AED ${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
          this.summaryAmountReceived   = fmt(s['total']?.amount    ?? 0);
          this.summaryChequesApproved  = fmt(s['credited']?.amount ?? 0);
          this.summaryChequesDeposited = fmt(s['realized']?.amount ?? 0);
          this.summaryCountApproved    = String(s['credited']?.count ?? 0);
          this.summaryCountDeposited   = String(s['realized']?.count ?? 0);
        },
      });
  }

  loadChequeMonthly() {
    this.leaseService.getChequeMonthly({ year: this.selectedYear })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          const rows: { month: string; amount: number }[] = resp?.content ?? [];
          this.chartData = RentalComponent.MONTHS.map(m => {
            const found = rows.find(r => r.month === m);
            return { name: m, value: found ? found.amount : 0 };
          });
        },
      });
  }

  onYearSelected(option: any) {
    this.selectedYear = option?.key ?? String(new Date().getFullYear());
    this.loadChequeSummary();
    this.loadChequeMonthly();
  }

  onLeaseClick(lease: any) {
    this.selectedLease = lease;
    this.showDetailView = true;
  }

  searchTextChange(text: string) {
    this.rentalSearchSubject$.next(text);
  }

  handleBackClick(): void {
    this.showDetailView = false;
  }
}
