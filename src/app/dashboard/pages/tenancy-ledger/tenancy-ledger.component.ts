import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Output,
} from '@angular/core';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { TableActionDropdownComponent } from '../../component/table-action-dropdown/table-action-dropdown.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TablePaginationComponent } from '../../component/table-pagination/table-pagination.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ResetIconComponent } from '../../component/icons/reset-icon/reset-icon.component';
import { ShareIconComponent } from '../../component/icons/share-icon/share-icon.component';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../component/badge/badge.component';
import { RentalAmountComponent } from '../../component/rental-amount/rental-amount.component';
import { DocumentTypeItemComponent } from '../../component/document-type-item/document-type-item.component';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { PropertyViewCardComponent } from '../../component/property-view-card/property-view-card.component';
import { Router } from '@angular/router';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { TermsconditionIconComponent } from '../../../icons/termscondition-icon/termscondition-icon.component';
import { ArrowDownIconComponent } from '../../../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
import { ReceiptIconComponent } from '../../../icons/receipt-icon/receipt-icon.component';
import { StatusActionDropdownComponent } from '../../../status-action-dropdown/status-action-dropdown.component';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomDropdownComponent } from '../../../component/custom-dropdown/custom-dropdown.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TenancyLedgerService } from '../../../tenancy-ledger.service';
import { AlertService } from '../../../shared/services/alert.service';
import { debounceTime, forkJoin, Subject } from 'rxjs';
import { FilterPopupButtonComponent } from '../../component/filter-popup-btn/filter-popup-btn.component';
import { FormsModule } from '@angular/forms';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { FormSelectFieldComponent } from '../../../shared/component/form-select-field/form-select-field.component';
import { SharedApiService } from '../../../shared/services/shared-api.service';
import { PropertyService } from '../../services/property.service';
import { LeaseService } from '../../services/lease.service';
import { NoDataComponent } from '../../../no-data/no-data.component';

@Component({
  selector: 'app-tenancy-ledger',
  standalone: true,
  imports: [
    TableTitleComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    FilterIconComponent,
    ExportIconComponent,
    SortingIconComponent,
    TableImgItemComponent,
    TableActionDropdownComponent,
    TableSelectComponent,
    TablePaginationComponent,
    TranslateModule,
    CommonModule,
    BadgeComponent,
    RentalAmountComponent,
    DocumentTypeItemComponent,
    WhiteCardComponent,
    PropertyViewCardComponent,
    TermsconditionIconComponent,
    ArrowDownIconComponent,
    ReceiptIconComponent,
    StatusActionDropdownComponent,
    NgbPopoverModule,
    CustomDropdownComponent,
    CustomSelectComponent,
    FilterPopupButtonComponent,
    FormsModule,
    FormSelectFieldComponent,
    TableActionButtonComponent,
    NoDataComponent,
  ],
  templateUrl: './tenancy-ledger.component.html',
  styleUrl: './tenancy-ledger.component.css',
})
export class TenancyLedgerComponent {
  @Output() detailViewChanges = new EventEmitter<boolean>();

  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);
  private sharedApiService = inject(SharedApiService);
  private propertyService = inject(PropertyService);
  private leaseService = inject(LeaseService);
  private translate = inject(TranslateService);

  // ── list state ────────────────────────────────────────────────────────────
  tenancyLedgerData: any[] = [];
  isLoading = false;
  totalRecords = 0;
  componentName = 'all-properties-component';
  rowsPerPageOptions = [10, 25, 50, 100];
  rowsPerPage = 10;
  currentPage = 1;
  searchText = '';
  private search$ = new Subject<string>();

  // filter state
  propertyOptions: { key: number; value: string }[] = [];
  statusOptions: { key: string; value: string }[] = [];
  pmcOptions: any[] = [];
  selectedPropertyType: any = null;
  selectedStatus: any = null;
  selectedPMC: any = null;
  filterPropertyType: string | null = null;
  filterStatus: string | null = null;
  filterPMC: string | null = null;

  documentActions = [
    { label: 'Share', icon: ShareIconComponent, action: 'share' },
    { label: 'Reset', icon: ResetIconComponent, action: 'reset' },
  ];

  // ── detail view state ─────────────────────────────────────────────────────
  showDetailView = false;
  isDetailLoading = false;

  // property card
  detailPropertyImages: { imgSrc: string }[] = [];
  detailPropertyName = '';
  detailPropertyLocation = '';
  detailPropertyStatus = '';
  detailPropertyRent = '';
  detailPropertyCode = '';
  detailPropertySections: {
    title: string;
    items: { label: string; value: string }[];
  }[] = [];

  // rent transactions (reuses tenant-detail pattern)
  rentTransactions: any[] = [];
  rentTotalRecords = 0;
  rentRowsPerPage = 10;
  rentCurrentPage = 1;
  rentComponentName = 'tenancy-ledger-rent';

  private rentSearch$ = new Subject<string>();
  rentSearchQuery = '';

  rentPaymentTypeOptions: { key: string; value: string }[] = [
    { key: 'CHEQUE', value: 'Cheque' },
    { key: 'CASH', value: 'Cash' },
    { key: 'BANK_TRANSFER', value: 'Bank Transfer' },
    { key: 'PDC', value: 'PDC' },
  ];
  rentStatusOptions: { key: string; value: string }[] = [
    { key: 'BALANCE', value: 'Balance' },
    { key: 'CREDITED', value: 'Credited' },
    { key: 'REALIZED', value: 'Realized' },
    { key: 'BOUNCED', value: 'Bounce' },
  ];
  selectedRentPaymentType: { key: string; value: string } | null = null;
  selectedRentStatus: { key: string; value: string } | null = null;
  appliedRentPaymentType: { key: string; value: string } | null = null;
  appliedRentStatus: { key: string; value: string } | null = null;

  private currentLeaseId: number | null = null;
  private currentPropertyId: number | null = null;

  constructor(
    private router: Router,
    private tenancyLedgerService: TenancyLedgerService,
  ) {}

  ngOnInit(): void {
    this.search$
      .pipe(debounceTime(400), takeUntilDestroyed(this.destroyRef))
      .subscribe((text: string) => {
        this.searchText = text.trim();
        this.currentPage = 1;
        this.loadTenancyLedger();
      });

    this.rentSearch$
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((q: string) => {
        this.rentSearchQuery = q.trim();
        this.rentCurrentPage = 1;
        if (this.currentLeaseId) this.loadRentTransactions(this.currentLeaseId);
      });

    this.loadTenancyLedger();

    this.sharedApiService.getOptionsType([
      {
        param: 'PARENT_PROPERTY',
        key: 'property',
        setter: (v) => (this.propertyOptions = v),
      },
      {
        param: 'TENANCY_LEDGER_AGREEMENT_STATUS',
        key: 'tenancy_ledger_agreement_status',
        setter: (v) => (this.statusOptions = v),
      },
      {
        param: 'TENANCY_STATUS',
        key: 'tenancy_status',
        setter: (v) => (this.pmcOptions = v),
      },
    ]);
  }

  // ── list helpers ──────────────────────────────────────────────────────────
  onRefresh(): void {
    this.loadTenancyLedger();
  }

  searchTextChange(text: string): void {
    this.search$.next(text);
  }

  buildParams(): Record<string, any> {
    const params: Record<string, any> = {
      page: this.currentPage,
      page_size: this.rowsPerPage,
    };
    if (this.searchText) params['search'] = this.searchText;
    if (this.filterPropertyType)
      params['property_id'] = this.filterPropertyType;
    if (this.filterStatus) params['agreement_status'] = this.filterStatus;
    if (this.filterPMC) params['property_status'] = this.filterPMC;
    return params;
  }

  loadTenancyLedger(): void {
    this.isLoading = true;
    this.tenancyLedgerService
      .getTenancyLedger(this.buildParams())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.tenancyLedgerData = resp?.content ?? [];
          this.totalRecords =
            resp?.pagination?.total_records ??
            resp?.content?.pagination?.total_records ??
            this.tenancyLedgerData.length;
          this.isLoading = false;
        },
        error: () => {
          this.tenancyLedgerData = [];
          this.totalRecords = 0;
          this.isLoading = false;
        },
      });
  }

  handleExportClick(): void {
    const params: Record<string, any> = {};
    if (this.searchText) params['search'] = this.searchText;
    this.tenancyLedgerService
      .exportTenacyLedger(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tenancyLedger.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        this.alertService.success('Exported successfully');
      });
  }

  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.loadTenancyLedger();
  }

  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.loadTenancyLedger();
  }

  clearPropertyType(): void {
    this.selectedPropertyType = null;
    this.filterPropertyType = null;
    this.applyFilter();
  }

  clearStatus(): void {
    this.selectedStatus = null;
    this.filterStatus = null;
    this.applyFilter();
  }

  clearPMC(): void {
    this.selectedPMC = null;
    this.filterPMC = null;
    this.applyFilter();
  }

  removeFilter(): void {
    this.filterPropertyType = null;
    this.filterStatus = null;
    this.filterPMC = null;
    this.selectedPropertyType = null;
    this.selectedStatus = null;
    this.selectedPMC = null;
    this.currentPage = 1;
    this.loadTenancyLedger();
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.loadTenancyLedger();
  }

  handleDropdownAction(action: string, row: any): void {
    if (action === 'share') {
      this.shareTenancyLedger(row.lease_id);
    }
  }

  shareTenancyLedger(leaseId: number): void {
    this.tenancyLedgerService
      .shareTenancyLedger(leaseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () =>
          this.alertService.success('Tenancy ledger shared successfully'),
        error: () => this.alertService.error('Failed to share tenancy ledger'),
      });
  }

  // ── detail view ───────────────────────────────────────────────────────────
  handleViewClick(row: any): void {
    this.showDetailView = true;
    this.detailViewChanges.emit(true);

    // reset previous data
    this.detailPropertyImages = [];
    this.detailPropertySections = [];
    this.rentTransactions = [];
    this.currentLeaseId = row.lease_id ?? null;
    this.currentPropertyId = row.property_id ?? null;

    this.isDetailLoading = true;
    this.loadPropertyDetail(row.property_id);

    if (this.currentLeaseId) {
      this.loadRentTransactions(this.currentLeaseId);
    }
  }

  private getLabel(key: string): string {
    return this.translate.instant(key);
  }

  private loadPropertyDetail(propertyId: number): void {
    if (!propertyId) {
      this.isDetailLoading = false;
      return;
    }

    forkJoin({
      property: this.propertyService.getProperties({ property_id: propertyId }),
      blocks: this.propertyService.getPropertyBlocks({
        property_id: propertyId,
      }),
      images: this.propertyService.getPropertyImages({
        property_id: propertyId,
      }),
      units: this.propertyService.getUnits({ property_id: propertyId }),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ property, blocks, images, units }) => {
          const prop = property?.content ?? null;

          if (prop) {
            this.detailPropertyName = prop.property_name || '';
            this.detailPropertyCode = prop.code || '';
            this.detailPropertyLocation =
              [prop.address_line_1, prop.address_line_2, prop.landmark]
                .filter(Boolean)
                .join(', ') || '';
            this.detailPropertyStatus =
              prop.status === 'PUBLIC' ? 'Public' : 'Draft';
            this.detailPropertyRent = prop.approx_rent
              ? `AED ${Number(prop.approx_rent).toLocaleString('en-US', {
                  maximumFractionDigits: 0,
                })}`
              : '';
          }

          this.detailPropertyImages = (images?.content || []).map(
            (img: any) => ({
              imgSrc: img.url,
            }),
          );

          const blockList: any[] = blocks?.content || [];
          const unitList: any[] = units?.content || [];

          this.detailPropertySections = [
            {
              title: 'PEROPERTY_DETAILS',
              items: [
                {
                  label: this.getLabel('PROPERTY_CODE'),
                  value: prop?.code || '--',
                },
                {
                  label: this.getLabel('PROPERTY_TYPE'),
                  value:
                    prop?.property_type
                      ?.map((t: any) => t.name ?? t.value ?? t)
                      .join(', ') || '--',
                },
                {
                  label: this.getLabel('NO_OF_BLOCKS'),
                  value: String(prop?.no_of_blocks ?? '--'),
                },
                {
                  label: this.getLabel('NO_OF_UNITS'),
                  value: String(prop?.no_of_units ?? '--'),
                },
                {
                  label: this.getLabel('LAND_AREA'),
                  value: prop?.land_area
                    ? `${prop.land_area} ${prop.land_area_unit}`
                    : '--',
                },
                {
                  label: this.getLabel('LAND_DM_NO'),
                  value: prop?.land_dm_no || '--',
                },
                {
                  label: this.getLabel('PLOT_NO'),
                  value: prop?.plot_no || '--',
                },
                {
                  label: this.getLabel('DEWA_NO'),
                  value: prop?.dewa_no || '--',
                },
                {
                  label: this.getLabel('PINCODE'),
                  value: prop?.pincode || '--',
                },
                {
                  label: this.getLabel('ADDRESS_1'),
                  value: prop?.address_line_1 || '--',
                },
                {
                  label: this.getLabel('ADDRESS_2'),
                  value: prop?.address_line_2 || '--',
                },
              ],
            },
            {
              title: 'BLOCK_DETAILS',
              items: blockList.length
                ? blockList.flatMap((b: any, i: number) => [
                    {
                      label: `${this.getLabel('BLOCK')} ${i + 1}`,
                      value: b.block_name || '--',
                    },
                    {
                      label: this.getLabel('NO_OF_FLOORS'),
                      value: String(b.no_of_floors ?? '--'),
                    },
                    {
                      label: this.getLabel('NO_OF_PARKING'),
                      value: String(b.no_of_parking ?? '--'),
                    },
                    {
                      label: this.getLabel('MAKANI_NO'),
                      value: b.makani_no || '--',
                    },
                    {
                      label: this.getLabel('NO_OF_UNITS'),
                      value: String(b.no_of_units ?? '--'),
                    },
                  ])
                : [
                    {
                      label: this.getLabel('BLOCKS'),
                      value: 'No blocks added',
                    },
                  ],
            },
            {
              title: 'UNIT_DETAILS',
              items: unitList.length
                ? unitList.flatMap((u: any, i: number) => [
                    {
                      label: `${this.getLabel('UNIT')} ${i + 1}`,
                      value: u.unit_name || '--',
                    },
                    {
                      label: this.getLabel('UNIT_CODE'),
                      value: u.code || '--',
                    },
                    {
                      label: this.getLabel('BLOCK_NAME'),
                      value: u.block_name || '--',
                    },
                    {
                      label: this.getLabel('UNIT_TYPE'),
                      value: u.unit_type || '--',
                    },
                  ])
                : [{ label: this.getLabel('UNITS'), value: 'No units added' }],
            },
          ];

          this.isDetailLoading = false;
        },
        error: () => {
          this.isDetailLoading = false;
        },
      });
  }

  private loadRentTransactions(leaseId: number): void {
    const params: Record<string, any> = {
      lease_id: leaseId,
      page: this.rentCurrentPage,
      page_size: this.rentRowsPerPage,
    };
    if (this.rentSearchQuery) params['search'] = this.rentSearchQuery;
    if (this.appliedRentPaymentType?.key)
      params['payment_type'] = this.appliedRentPaymentType.key;
    if (this.appliedRentStatus?.key)
      params['status'] = this.appliedRentStatus.key;

    this.leaseService
      .getLeaseCheques(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.rentTransactions = resp?.content?.all_cheques ?? [];
          this.rentTotalRecords =
            resp?.pagination?.total_records ??
            resp?.content?.total_records ??
            this.rentTransactions.length;
        },
        error: () => {
          this.rentTransactions = [];
          this.rentTotalRecords = 0;
        },
      });
  }

  handleBackClick(): void {
    this.showDetailView = false;
    this.detailViewChanges.emit(false);
  }

  // ── rent filter / search helpers ──────────────────────────────────────────
  onRentSearchChange(text: string): void {
    this.rentSearch$.next(text);
  }

  onRentRefresh(): void {
    if (this.currentLeaseId) this.loadRentTransactions(this.currentLeaseId);
  }

  onRentPaymentTypeSelect(option: any): void {
    this.selectedRentPaymentType = option;
  }

  onRentStatusSelect(option: any): void {
    this.selectedRentStatus = option;
  }

  applyRentFilter(): void {
    this.appliedRentPaymentType = this.selectedRentPaymentType;
    this.appliedRentStatus = this.selectedRentStatus;
    this.rentCurrentPage = 1;
    if (this.currentLeaseId) this.loadRentTransactions(this.currentLeaseId);
  }

  removeRentFilter(): void {
    this.selectedRentPaymentType = null;
    this.selectedRentStatus = null;
    this.appliedRentPaymentType = null;
    this.appliedRentStatus = null;
    this.rentCurrentPage = 1;
    if (this.currentLeaseId) this.loadRentTransactions(this.currentLeaseId);
  }

  clearRentPaymentTypeFilter(): void {
    this.selectedRentPaymentType = null;
    this.appliedRentPaymentType = null;
    this.rentCurrentPage = 1;
    if (this.currentLeaseId) this.loadRentTransactions(this.currentLeaseId);
  }

  clearRentStatusFilter(): void {
    this.selectedRentStatus = null;
    this.appliedRentStatus = null;
    this.rentCurrentPage = 1;
    if (this.currentLeaseId) this.loadRentTransactions(this.currentLeaseId);
  }

  onRentPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.rentComponentName) return;
    this.rentRowsPerPage = event.pageSize;
    this.rentCurrentPage = 1;
    if (this.currentLeaseId) this.loadRentTransactions(this.currentLeaseId);
  }

  onRentPageChange(event: PageChange): void {
    if (event.componentName !== this.rentComponentName) return;
    this.rentCurrentPage = event.currentPage;
    if (this.currentLeaseId) this.loadRentTransactions(this.currentLeaseId);
  }

  transactionStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('credit') || s.includes('paid') || s.includes('realiz'))
      return 'badge-active';
    if (s.includes('bounce') || s.includes('reject')) return 'badge-rejected';
    if (s.includes('invoice') || s.includes('generat')) return 'badge-draft';
    return 'badge-inactive';
  }

  // misc (kept for backward compat with any parent binding)
  showReceiptDropdown = false;
  showMonthDropdown = false;
  selectedReceiptType = '';

  toggleReceipt(): void {
    this.showReceiptDropdown = !this.showReceiptDropdown;
    this.showMonthDropdown = false;
  }

  selectReceiptType(type: string): void {
    this.selectedReceiptType = type;
    this.showMonthDropdown = true;
  }
}
