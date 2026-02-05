import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../shared/model/shared.model';
import { SharedService } from '../../../shared.service';
import { PlusIconComponent } from '../../../shared/component/icons/plus-icon/plus-icon.component';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TablePaginationComponent } from '../../component/table-pagination/table-pagination.component';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { Subscription } from 'rxjs';
import { UploadIconComponent } from '../../component/icons/upload-icon/upload-icon.component';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { DateIconComponent } from '../../component/icons/date-icon/date-icon.component';
import { SharedApiService } from '../../../shared/services/shared-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RentalAccountService } from '../../rental-account.service';
import { ScannericonComponent } from '../../../icon/scannericon/scannericon.component';
import { FormService } from '../../../shared/services/form.service';
import { ToggleiconComponent } from '../../../icon/toggleicon/toggleicon.component';
import { ThemeService, UserRole } from '../../../theme.service';

@Component({
  selector: 'app-add-rentalaccount',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PlusIconComponent,
    TableTitleComponent,
    TableSelectComponent,
    TablePaginationComponent,
    TableFilterButtonComponent,
    UploadIconComponent,
    CustomSelectComponent,
    DateIconComponent,
    ReactiveFormsModule,
    ScannericonComponent,
    NgbDatepickerModule,
    ToggleiconComponent,
  ],
  templateUrl: './add-rentalaccount.component.html',
  styleUrl: './add-rentalaccount.component.css',
})
export class AddRentalaccountComponent implements OnInit {
  private sharedService = inject(SharedService);
  private formService = inject(FormService);
  private api = inject(SharedApiService);
  private rentalAccountService = inject(RentalAccountService);
  private sharedApiService = inject(SharedApiService);
  isInvalid = this.formService.isInvalid;
  constructor(
    private modalService: NgbModal,
    private router: Router,
    private themeService: ThemeService,
  ) {}
  showReason: boolean = false;
  isEditMode = false;
  showDetailView = false;
  isCash = false;

  assignedPropertyList: any[] = [];
  selectedAssignedProperty: any = null;

  private fb = inject(FormBuilder);
  rentalForm = this.fb.group({
    tenantName: [''],
    email: [''],
    contact_number: [''],
    periodFrom: [''],
    periodTo: [''],
    unitType: [''],
    rent: [''],
  });
  rentalPayments: any[] = [];
  private showDetailSubscription!: Subscription;
  componentName = 'RentalComponent';
  totalRecords = 0;
  rowsPerPageOptions = [10, 25, 50, 100];
  rowsPerPage = 10;
  currentPage = 1;
  isOtherCharges = false;
  tenant: any;
  leaseList: any;
  leaseStatus: any;
  selectedleasestatus: any;
  private destroyRef = inject(DestroyRef);
  private translate = inject(TranslateService);
  currentRole: UserRole = 'owner';

  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Rental', link: '' },
  ];
  ngOnInit(): void {
    this.showDetailSubscription = this.sharedService.showDetail$.subscribe(
      (value: boolean) => {
        this.showDetailView = value;
      },
    );
    this.loadBreadcrumb();

    this.sharedService.initLanguage();

    this.initLanguageListener();
    this.initCurrentRoleListener();
    this.sharedService.initLanguage();
    this.initLanguageListener();
    this.loadRentalPayments();
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

  charges = [
    {
      label: 'Admin Fee',
      amount: 32.71,
      tax: 'VAT @5%',
      vat: 1.64,
      total: 34.35,
      checked: true,
    },
    {
      label: 'Ejari Charge Disbursement',
      amount: 175.65,
      tax: 'VAT @Nil',
      vat: 0,
      total: 175.65,
      checked: true,
    },
    {
      label: 'Gas Charges',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: true,
    },
    {
      label: 'COMMISSION- DUBAI',
      amount: 1200,
      tax: 'VAT @5%',
      vat: 60,
      total: 1260,
      checked: true,
    },
    {
      label: 'Security Deposit',
      amount: 2400,
      tax: 'VAT @Nil',
      vat: 0,
      total: 2400,
      checked: true,
    },
    {
      label: 'CAR PARKING',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: true,
    },
    {
      label: 'TAWTHEEQ REGISTRATION A/C...',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: true,
    },
    {
      label: 'RENEWAL COMMISSION (DUBAI)',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: false,
    },
    {
      label: 'RENEWAL COMMISSION (SHARJ...)',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: false,
    },
    {
      label: 'R COMMISSION- ABU DHABI BL...',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: false,
    },
    {
      label: 'TAWTHEEQ SERVICE INCOME- A...',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: false,
    },
  ];

  handleFilterClick(): void {
    this.getOptionTypes(['RENTAL_ACCOUNT_LEASE']);
    console.log('Filter button clicked');
  }

  getOptionTypes(options: string[]) {}
  onEdit() {
    this.isEditMode = true;
  }

  onSaveChanges() {
    this.sharedService.showDetails();
    console.log('Saved changes!');
    this.router.navigate(['/dashboard/rental']);
  }

  openAddChargesModal(content: any) {
    this.showReason = false;
    this.modalService.open(content, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
  }

  openScanChargesModal(content: any) {
    this.showReason = true;
    this.modalService.open(content, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
  }

  addCharge(modal: any) {
    this.isEditMode = true;
    console.log('Charge Added');
    modal.close();
  }

  onAddCheques() {
    this.isEditMode = true;
  }

  onClose() {
    this.isEditMode = false;
  }

  onPaymentToggle(event: Event) {
    this.isCash = (event.target as HTMLInputElement).checked;
  }

  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
  }

  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
  }

  onRefresh() {}

  get totalAmount(): number {
    return this.charges
      .filter((c) => c.checked)
      .reduce((sum, c) => sum + c.total, 0);
  }

  handleBackClick() {
    throw new Error('Method not implemented.');
  }

  //------------------------------------------------------------rental add ---------------------------------------------------------------------------

  onLinkPropertyClick(): void {
    this.api
      .getOptions({ option_type: 'RENTAL_ACCOUNT_LEASE' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.assignedPropertyList = res?.content?.lease_data || [];
        },
        error: (err) => console.error(err),
      });
  }

  private formatDate(timestamp: number): string {
    if (!timestamp) return '';
    return new Date(timestamp * 1000).toISOString().split('T')[0];
  }

  onAssignedPropertySelected(option: any): void {
    this.selectedAssignedProperty = option;
    if (!option?.key) return;

    this.rentalAccountService
      .getLeaseDetailsById(option.key)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const lease = res?.content?.[0];
          if (lease) {
            this.mapLeaseDetails(lease);
          }
        },
        error: (err) => console.error(err),
      });
  }

  loadRentalPayments(): void {
    const params = {
      page: this.currentPage,
      limit: this.rowsPerPage,
    };

    this.rentalAccountService
      .getRentalPayments(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.rentalPayments = res?.content || [];
          this.totalRecords = res?.total_records || 0;
        },
        error: (err) => console.error(err),
      });
  }
  private mapLeaseDetails(lease: any): void {
    this.rentalForm.patchValue({
      tenantName: lease?.tenant?.first_name ?? '',
      email: lease?.tenant?.email ?? '',
      contact_number: lease?.tenant?.contact_number ?? '',
      unitType: lease?.lease_property?.property_unit_name ?? '',
      rent: lease?.rent ?? '-',
      periodFrom: this.formatDate(lease?.lease_start_date),
      periodTo: this.formatDate(lease?.lease_end_date),
    });
  }
}
