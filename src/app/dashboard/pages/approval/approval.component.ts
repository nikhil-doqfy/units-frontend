import {
  Component,
  DestroyRef,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { CardTitleComponent } from '../../../shared/component/card-title/card-title.component';
import { AcceptIconComponent } from '../../component/icons/accept-icon/accept-icon.component';
import { RejectIconComponent } from '../../component/icons/reject-icon/reject-icon.component';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { TablePaginationComponent } from '../../../dashboard/component/table-pagination/table-pagination.component';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { TableViewCardComponent } from '../../component/table-view-card/table-view-card.component';
import { DocumentTypeItemComponent } from '../../component/document-type-item/document-type-item.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../shared.service';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApprovalService } from '../../approval.service';
import { AlertService } from '../../../shared/services/alert.service';
import { debounceTime, Subject } from 'rxjs';
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../shared/model/shared.model';
import { RefreshIconComponent } from '../../component/icons/refresh-icon/refresh-icon.component';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BackIconComponent } from '../../component/icons/back-icon/back-icon.component';
import { EditIconComponent } from '../../component/icons/edit-icon/edit-icon.component';
@Component({
  selector: 'app-approval',
  standalone: true,
  imports: [
    CommonModule,
    WhiteCardComponent,
    CardTitleComponent,
    AcceptIconComponent,
    RejectIconComponent,
    TableImgItemComponent,
    TableSelectComponent,
    TableActionButtonComponent,
    TablePaginationComponent,
    SortingIconComponent,
    TableViewCardComponent,
    DocumentTypeItemComponent,
    TranslateModule,
    NoDataComponent,
    RefreshIconComponent,
    CustomSelectComponent,
    ReactiveFormsModule,
    TranslateModule,
    CommonModule,
    FormsModule,
    BackIconComponent,
    EditIconComponent,
  ],
  templateUrl: './approval.component.html',
  styleUrl: './approval.component.css',
})
export class ApprovalComponent {
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);
  private approvalService = inject(ApprovalService);
  private alertService = inject(AlertService);
  private onOwnerSearch$ = new Subject<string>();

  componentName: string = 'ApprovalComponent';
  selectedTenant: any = null;
  closeResult: WritableSignal<string> = signal('');
  leaseDocuments: any[] = [];
  documentsByType: any = {
    EMIRATES_ID: [],
    PASSPORT_SELF: [],
    PASSPORT_FAMILY: [],
    EMPLOYMENT_PROOF: [],
    VISA_SELF: [],
    VISA_FAMILY: [],
    BANK_STATEMENT: [],
  };
  tenantList: any[] = [];
  managerApprovalList: any[] = [];
  currentStatus: 'APPROVED' | 'REJECTED' | 'PENDING' = 'PENDING';
  approvalData: Record<string, any> = {};
  totalRecords: number = 0;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;
  // ── Tenant detail view ───────────────────────────────────────────
  showTenantDetail = false;
  selectedTenantLease: any = null;

  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Approval', link: '' },
  ];
  currentLanguage = 'en';
  showDetailView: boolean = false;

  constructor(private router: Router) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
    this.initOwnerSearchLisner();

    const id = this.route.snapshot.paramMap.get('tenant_id');

    if (id) {
      this.showDetailView = true;
      this.getApprovalDetails(+id);
    } else {
      this.showDetailView = false;
    }
  }

  charges = [
    {
      label: 'Admin Fee',
      amount: 32.71,
      tax: 'VAT @5%',
      vat: 1.64,
      total: 34.35,
      checked: true,
      isEdit: false,
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

  ngOnInit() {
    this.loadBreadcrumb();
    this.sharedService.initLanguage();
    this.initLanguageListener();
    this.loadManagerApprovals();
    this.refreshDetailsView();
    this.initLanguageListener();
  }

  loadManagerApprovals(): void {
    const params: Record<string, any> = {
      status: this.currentStatus,
      page: this.currentPage,
      page_size: this.rowsPerPage,
    };
    this.approvalService
      .getManagerApprovals(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.managerApprovalList = (resp?.content ?? []).map((a: any) => ({
            id: a.id,
            date_request: a.requested_date
              ? new Date(a.requested_date).toLocaleDateString('en-GB')
              : 'N/A',
            requested_by: a.created_by ?? '—',
            property_name: a.property ?? 'N/A',
            tower: a.block ?? 'N/A',
            unit: a.unit ?? 'N/A',
            tenant_name: a.tenant ?? 'N/A',
            tenure: a.requested_tenure ?? '—',
            rent:
              a.requested_rent != null
                ? `AED ${parseFloat(a.requested_rent).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '—',
            actual_rent:
              a.actual_rent != null
                ? `AED ${parseFloat(a.actual_rent).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '—',
            approved: a.approved,
            status: a.status ?? (a.approved ? 'APPROVED' : 'PENDING'),
            profile_image: a.tenant_image ?? '',
            property_image: a.property_image ?? null,
          }));
          this.totalRecords = resp?.pagination?.total_records ?? 0;
          this.totalPages = Math.ceil(this.totalRecords / this.rowsPerPage);
        },
      });
  }

  approveManagerItem(id: number): void {
    this.approvalService
      .updateManagerApproval({ approval_id: id, action: 'approve' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.alertService.success(resp?.message ?? 'Approved successfully');
          this.loadManagerApprovals();
        },
        error: () =>
          this.alertService.error('Failed to approve. Please try again.'),
      });
  }

  rejectManagerItem(id: number): void {
    this.approvalService
      .updateManagerApproval({ approval_id: id, action: 'reject' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.alertService.success(resp?.message ?? 'Rejected');
          this.loadManagerApprovals();
        },
        error: () =>
          this.alertService.error('Failed to reject. Please try again.'),
      });
  }

  get totalAmount(): number {
    return this.charges
      .filter((c) => c.checked)
      .reduce((sum, c) => sum + c.total, 0);
  }
  initLanguageListener() {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadBreadcrumb();
      });
  }

  viewTenant(row: any) {
    const tenantId = row?.tenant?.id;
    if (!tenantId) return;
    this.selectedTenantLease = { tenant: { id: tenantId } };
    this.showTenantDetail = true;
  }
  viewProperty(prop: any) {
    console.log('Selected property:', prop);
    console.log('Property ID:', prop.property_id);

    const id = prop.property_id || prop.id;

    if (id) {
      this.router.navigate(['/dashboard/properties', id]);
    }
  }
  loadBreadcrumb() {
    this.setBreadCrumb([
      { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
      { label: 'PAGE_TITLE.APPROVAL', link: '' },
    ]);
  }

  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }

  refreshDetailsView() {
    if (this.showDetailView && this.selectedTenant?.tenant_id) {
      this.getApprovalDetails(this.selectedTenant.tenant_id);
    } else {
      // this.loadApprovalList();
    }
  }

  loadApprovalList(): void {
    this.approvalData = {
      ...this.approvalData,
      limit: this.rowsPerPage,
      page_number: this.currentPage,
      tenant_status: this.currentStatus,
    };

    if (this.currentStatus !== 'PENDING') {
      this.approvalData['tenant_status'] = this.currentStatus;
    } else {
      delete this.approvalData['tenant_status'];
    }
    this.approvalService
      .getApprovalList(this.approvalData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.tenantList = resp?.content.tenants ?? [];
          this.totalRecords = resp?.pagination?.total_records ?? 0;
          this.totalPages = Math.ceil(this.totalRecords / this.rowsPerPage);
        },
      });
  }

  changeStatus(status: 'APPROVED' | 'REJECTED' | 'PENDING') {
    this.currentStatus = status;
    this.currentPage = 1;
    this.loadManagerApprovals();
  }

  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.loadManagerApprovals();
  }

  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.loadManagerApprovals();
  }

  initOwnerSearchLisner() {
    this.onOwnerSearch$
      .pipe(debounceTime(1000), takeUntilDestroyed(this.destroyRef))
      .subscribe((searchText) => {
        if (searchText?.trim()) this.approvalData['search'] = searchText.trim();
        else delete this.approvalData['search'];

        this.currentPage = 1;
        // this.loadApprovalList();
      });
  }

  searchTextChange(search: string) {
    this.onOwnerSearch$.next(search);
  }

  handleRejectClick(): void {
    const tenant_id = Number(this.route.snapshot.paramMap.get('tenant_id'));

    if (!tenant_id) {
      console.error('LeaseId not found in URL');
      return;
    }

    const data = {
      tenant_id: tenant_id,
      tenant_status: 'REJECTED',
    };

    this.editTenantApprovalStatus(data);
  }

  handleApproveClick(): void {
    const tenant_id = Number(this.route.snapshot.paramMap.get('tenant_id'));

    if (!tenant_id) {
      console.error('LeaseId not found in URL');
      return;
    }

    const data = {
      tenant_id: tenant_id,
      tenant_status: 'APPROVED',
    };

    this.editTenantApprovalStatus(data);
  }

  editTenantApprovalStatus(data: Record<string, any>) {
    this.approvalService
      .editApproval(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          this.alertService.success(resp.message);

          this.refreshDetailsView();
        },
      });
  }

  getApprovalTenant(tenantId: number) {
    const params = {
      tenant_id: tenantId,
    };

    this.approvalService
      .getApprovalList(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          console.log('TENANTS:', resp?.content?.tenants);
          this.selectedTenant = resp.content.tenants;

          this.leaseDocuments = resp.content?.lease_documents || [];

          this.mapDocumentsByType();
        },
      });
  }

  mapDocumentsByType() {
    Object.keys(this.documentsByType).forEach((key) => {
      this.documentsByType[key] = [];
    });

    this.leaseDocuments.forEach((doc) => {
      if (this.documentsByType[doc.type]) {
        this.documentsByType[doc.type].push(doc);
      }
    });
  }

  // handleViewClick(tenantId: number): void {
  //   this.router.navigate(['/dashboard/approval/detail/', tenantId]);
  // }
  handleViewClick(id: number) {
    this.selectedTenant = this.tenantList.find(
      (tenant: any) => tenant.tenant_id === id,
    );

    this.showDetailView = true;
  }
  handleBackClick(): void {
    this.router.navigate(['/dashboard/approval']);
    this.showDetailView = false;
    this.selectedTenant = null;
  }
  getApprovalDetails(tenantId: number): void {
    this.approvalService
      .getApprovalList({ tenant_id: tenantId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.selectedTenant = resp?.content?.[0]?.user ?? null;
          this.leaseDocuments = resp?.content?.lease_documents ?? [];
          this.mapDocumentsByType();
        },
      });
  } /*-------OTHER CHARGES ACTION  COLUMN------------------------*/
  editRow(row: any) {
    console.log('clicked', row);
    row.isEdit = true;
  }

  saveRow(row: any) {
    console.log('saved', row);
    row.isEdit = false;
  }
  sortField: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';
  sort(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }

    this.managerApprovalList = this.sharedService.sortData(
      this.managerApprovalList,
      field,
      this.sortOrder,
    );
  }
}
