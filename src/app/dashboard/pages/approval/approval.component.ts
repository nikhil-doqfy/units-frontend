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
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
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
  selectedTenant: any = null;
  closeResult: WritableSignal<string> = signal('');
  // ApprovalList: any[] = [];
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
  approvedList: any[] = [];
  tenantList: any[] = [];
  currentStatus: 'APPROVED' | 'REJECTED' | 'PENDING' = 'PENDING';
  pendingList: any[] = [];
  rejectedList: any[] = [];
  approvalData: Record<string, any> = {};
  totalRecords: number = 0;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Approval', link: '' },
  ];
  componentName: string = 'ApprovalComponent';
  currentLanguage = 'en';
  showDetailView: boolean = false;
  constructor(private router: Router) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);

    this.onOwnerSearch$
      .pipe(debounceTime(1000), takeUntilDestroyed(this.destroyRef))
      .subscribe((searchText) => {
        if (searchText?.trim()) this.approvalData['search'] = searchText.trim();
        else delete this.approvalData['search'];

        this.currentPage = 1;
        this.loadApprovalList();
      });
  }

  ngOnInit() {
    this.loadBreadcrumb();

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadBreadcrumb());
  }

  async loadBreadcrumb() {
    this.breadcrumbData = await this.sharedService.getBreadcrumbs([
      { key: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
      { key: 'PAGE_TITLE.APPROVAL', link: '' },
    ]);
    const lang = localStorage.getItem('language') || 'en';
    this.currentLanguage = lang;
    this.translate.use(lang);
    const direction = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = direction;

    const tenantId = Number(this.route.snapshot.paramMap.get('tenantId'));
    const leaseId = Number(this.route.snapshot.paramMap.get('leaseId'));

    if (tenantId || leaseId) {
      this.showDetailView = true;
      this.approveTenant(tenantId, leaseId);
    } else {
      this.showDetailView = false;
      this.loadApprovalList();
    }
  }

  approvalList: any[] = [];

  loadApprovalList(): void {
    console.log(
      'Approval List API params:',
      this.approvalData,
      'Status:',
      this.currentStatus
    );

    this.approvalData = {
      ...this.approvalData,
      limit: this.rowsPerPage,
      page_number: this.currentPage,
      status: this.currentStatus,
    };

    this.approvalService
      .getApprovalList(this.approvalData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.tenantList = resp?.content ?? [];
        },
        error: (err) => console.error('Approval List API Error:', err),
      });
  }

  refreshDetailsView() {
    const tenantId = Number(this.route.snapshot.paramMap.get('tenantId'));
    const leaseId = Number(this.route.snapshot.paramMap.get('leaseId'));

    if (tenantId || leaseId) {
      this.showDetailView = true;
      this.approveTenant(tenantId, leaseId);
    } else {
      this.showDetailView = false;
      this.loadApprovalList();
    }
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

  changeStatus(status: 'APPROVED' | 'REJECTED' | 'PENDING') {
    this.currentStatus = status;
    this.currentPage = 1;
    this.loadApprovalList();
  }
  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.loadApprovalList();
  }
  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.loadApprovalList();
  }

  searchTextChange(search: string) {
    this.onOwnerSearch$.next(search);
  }
  handleRejectClick(leaseId: number): void {
    const params = {
      lease_id: leaseId,
      approval_status: 'REJECTED',

      ...this.approvalData,
      limit: this.rowsPerPage,
      page_number: this.currentPage,
    };
    this.approvalData['limit'] = this.rowsPerPage;
    this.approvalData['page_number'] = this.currentPage;

    this.approvalService
      .getApprovalList(params, 'PUT')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          this.alertService.success('Tenant Rejected Successfully');

          this.pendingList = resp?.content ?? [];
          this.loadApprovalList();
          this.totalRecords = resp?.pagination?.total_records ?? 0;
          this.totalPages = Math.ceil(this.totalRecords / this.rowsPerPage);
        },
        error: (err) => {
          this.alertService.error('Rejection failed');
          console.error(err);
        },
      });

    console.log('Reject button clicked');
  }

  handleApproveClick(leaseId: number): void {
    const params = {
      lease_id: leaseId,
      approval_status: 'APPROVED',
    };
    console.log('Step 1 - Params to approve:', params);
    this.approvalData = {
      ...this.approvalData,
      limit: this.rowsPerPage,
      page_number: this.currentPage,
    };

    this.approvalService
      .getApprovalList(params, 'PUT')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          this.alertService.success('Tenant Approved Successfully');

          this.approvedList = resp?.content ?? [];

          this.loadApprovalList();
        },
        error: (err) => {
          this.alertService.error('Approval failed');
          console.error(err);
        },
      });
    console.log('Approve button clicked');
  }

  approveTenant(tenantId: number, leaseId: number) {
    const params = {
      lease_id: leaseId,

      tenant_id: tenantId,
    };

    console.log('Tenant API params:', params);
    this.approvalService
      .getApprovalList(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          console.log('FULL RESPONSE --->', resp);
          console.log('CONTENT --->', resp?.content);
          this.selectedTenant = resp.content.tenant_details;

          this.leaseDocuments = resp.content?.lease_documents || [];

          this.mapDocumentsByType();
          this.alertService.success('teanant data fetched');
        },
        error: (err) => {
          this.alertService.error('Approval failed');
          console.error(err);
        },
      });
  }

  handleViewClick(tenantId: number, leaseId: number): void {
    this.router.navigate(['/dashboard/approval/list/', tenantId, leaseId]);
  }

  handleBackClick(): void {
    this.router.navigate(['/dashboard/approval']);
    this.loadApprovalList();
    this.showDetailView = false;
    this.selectedTenant = null;
  }
}
