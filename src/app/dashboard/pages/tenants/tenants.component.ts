import {
  Component,
  inject,
  signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService, UserRole } from '../../../theme.service';

import {
  ModalDismissReasons,
  NgbActiveModal,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';

import { TableTitleComponent } from '../../../dashboard/component/table-title/table-title.component';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../../dashboard/component/table-filter-btn/table-filter-btn.component';
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { PlusIconComponent } from '../../../shared/component/icons/plus-icon/plus-icon.component';
import { InviteIconComponent } from '../../component/icons/invite-icon/invite-icon.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { TableActionDropdownComponent } from '../../component/table-action-dropdown/table-action-dropdown.component';
import { ShareIconComponent } from '../../component/icons/share-icon/share-icon.component';
import { ResetIconComponent } from '../../component/icons/reset-icon/reset-icon.component';
import { TablePaginationComponent } from '../../../dashboard/component/table-pagination/table-pagination.component';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { AddTenantFormComponent } from '../../component/forms/add-tenant-form/add-tenant-form.component';
import { InviteTenantFormComponent } from '../../component/forms/invite-tenant-form/invite-tenant-form.component';
import { SendIconComponent } from '../../component/icons/send-icon/send-icon.component';
import { TableViewCardComponent } from '../../component/table-view-card/table-view-card.component';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { DocumentTypeItemComponent } from '../../component/document-type-item/document-type-item.component';
import { TenantsService } from '../../services/tenants.service';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { AlertService } from '../../../shared/services/alert.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [
    CommonModule,
    TableTitleComponent,
    TableImgItemComponent,
    TableSelectComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    FilterIconComponent,
    ExportIconComponent,
    PlusIconComponent,
    InviteIconComponent,
    TableActionButtonComponent,
    TableActionDropdownComponent,
    TablePaginationComponent,
    SortingIconComponent,
    AddTenantFormComponent,
    InviteTenantFormComponent,
    SendIconComponent,
    TableViewCardComponent,
    WhiteCardComponent,
    DocumentTypeItemComponent,
    TranslateModule,
  ],
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.css',
})
export class TenantsComponent {
  private tenantsService = inject(TenantsService);
  private modalService = inject(NgbModal);
  private alertService = inject(AlertService);

  componentName: string = 'TenantsComponent';
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Tenants', link: '' },
  ];

  currentRole: UserRole = 'owner';
  closeResult: WritableSignal<string> = signal('');

  showDetailView: boolean = false;

  documentActions = [
    { label: 'Share', icon: ShareIconComponent, action: 'share' },
    { label: 'Reset', icon: ResetIconComponent, action: 'reset' },
  ];

  tenantsList: any[] = [];
  tenantsFilter: Record<string, any> = {};
  totalRecords: number = 0;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;
  onTenantsSearch$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private router: Router, private themeService: ThemeService) {
    this.onTenantsSearch$
      .pipe(debounceTime(1500), takeUntil(this.destroy$))
      .subscribe((value) => {
        if (value?.trim()) this.tenantsFilter['search'] = value.trim();
        else delete this.tenantsFilter['search'];

        this.getTenants();
      });
  }

  ngOnInit() {
    this.themeService.currentRole$
      .pipe(takeUntil(this.destroy$))
      .subscribe((role) => {
        this.currentRole = role;
      });
    this.getTenants();
  }

  private getTenants() {
    this.tenantsFilter = {
      ...this.tenantsFilter,
      limit: this.rowsPerPage,
      page: this.currentPage,
    };

    this.tenantsService
      .getTenants(this.tenantsFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp: any) => {
          this.tenantsList = resp?.content?.tenants ?? [];
          this.totalRecords = resp?.pagination?.total_records ?? 0;
        },
        error: (err) => {},
      });
  }

  onRefresh() {
    this.getTenants();
  }

  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.getTenants();
  }

  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.getTenants();
  }

  handleDropdownAction(action: string) {
    console.log(`${action} action clicked`);
  }

  handleFilterClick(): void {
    console.log('Filter button clicked');
  }

  handleExportClick(): void {
    console.log('Export button clicked');
  }

  openAddTenantModal(addTenantContent: TemplateRef<any>) {
    const modalRef = this.modalService.open(addTenantContent, {
      ariaLabelledBy: 'modal-title',
      windowClass: 'mdlCommon',
      centered: true,
    });

    modalRef.result.then(
      (result) => {
        this.closeResult.set(`Closed with: ${result}`);
      },
      (reason) => {
        this.closeResult.set(`Dismissed ${this.getDismissReason(reason)}`);
      }
    );
  }

  openInviteTenantModal(inviteTenantContent: TemplateRef<any>) {
    const modalRef = this.modalService.open(inviteTenantContent, {
      ariaLabelledBy: 'modal-title',
      windowClass: 'mdlCommon mdlSmall',
      centered: true,
    });

    modalRef.result.then(
      (result) => {
        this.closeResult.set(`Closed with: ${result}`);
      },
      (reason) => {
        this.closeResult.set(`Dismissed ${this.getDismissReason(reason)}`);
      }
    );
  }

  private getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.ESC:
        return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK:
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }

  sendInvite(
    inviteFormRef: InviteTenantFormComponent,
    modal?: NgbActiveModal | any
  ) {
    const form = inviteFormRef.tenantForm;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    let payload = { email: form.value.email };
    this.tenantsService
      .addTenantToInvite(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp: any) => {
          this.alertService.success(resp.message);
          modal?.close('Save click');
        },
      });
  }

  handleEditClick(): void {
    console.log('Edit button clicked');
  }

  handleDeleteClick(): void {
    console.log('Delete button clicked');
  }

  handleViewClick(): void {
    this.showDetailView = true;
  }

  handleBackClick(): void {
    this.showDetailView = false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
