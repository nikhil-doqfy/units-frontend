import {
  Component,
  DestroyRef,
  inject,
  signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
import { debounceTime, Subject } from 'rxjs';
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../shared/model/shared.model';
import { AlertService } from '../../../shared/services/alert.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { MaskPhonePipe } from '../../../shared/pipes/mask-phone.pipe';
import { SharedService } from '../../../shared.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FilterPopupButtonComponent } from '../../component/filter-popup-btn/filter-popup-btn.component';
import { SharedApiService } from '../../../shared/services/shared-api.service';

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
    ExportIconComponent,
    PlusIconComponent,
    InviteIconComponent,
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
    NoDataComponent,
    MaskPhonePipe,
  ],
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.css',
})
export class TenantsComponent {
  private tenantsService = inject(TenantsService);
  private modalService = inject(NgbModal);
  private alertService = inject(AlertService);
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  private destroyRef = inject(DestroyRef);
  private translate = inject(TranslateService);
  private sharedApiService = inject(SharedApiService);
  tennatDocuments: Record<string, any[]> = {};
  componentName: string = 'TenantsComponent';
  breadcrumbData: BreadCrumb[] = [];
  currentRole: UserRole = 'owner';
  closeResult: WritableSignal<string> = signal('');
  showDetailView: boolean = false;
  totalPages: number = 1;
  activeDocTypeKey!: string;
  documentActions = [
    { label: 'Share', icon: ShareIconComponent, action: 'share' },
    { label: 'Reset', icon: ResetIconComponent, action: 'reset' },
  ];
  selectedTenant: any = null;
  tenantsList: any[] = [];
  tenantsFilter: Record<string, any> = {};
  totalRecords: number = 0;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;
  private onTenantsSearch$ = new Subject<string>();
  currentLanguage = 'en';

  constructor(private router: Router, private themeService: ThemeService) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
    this.initTenantSearchListener();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.showDetailView = true;
      this.getTenantDetails(+id);
    } else {
      this.showDetailView = false;
      this.getTenants();
    }
  }

  ngOnInit() {
    this.loadBreadcrumb();
    this.initCurrentRoleListener();
    this.sharedService.initLanguage();
    this.initLanguageListener();
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
      { label: 'PAGE_TITLE.TENANTS', link: '' },
    ]);
  }

  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }

  private getTenants() {
    this.tenantsFilter = {
      ...this.tenantsFilter,
      limit: this.rowsPerPage,
      page: this.currentPage,
    };

    this.tenantsService
      .getTenants(this.tenantsFilter)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.tenantsList = resp?.content ?? [];
          console.log(' TENANT OBJECT:', this.tenantsList[0]);
          this.totalRecords = resp?.pagination?.total_records ?? 0;
          this.totalPages = Math.ceil(this.totalRecords / this.rowsPerPage);
        },
        error: (err) => {},
      });
  }

  onDocTabClick(type: any) {
    this.activeDocTypeKey = type.key;
  }
  onRefresh() {
    this.getTenants();
  }

  searchTextChange(search: string): void {
    this.onTenantsSearch$.next(search);
  }
  tenantDocumentType: any[] = [];
  getOptionTypes() {
    if (this.showDetailView) {
      this.sharedApiService.getOptionsType([
        {
          param: 'PROPERTY_DOCUMENT_CHOICE',
          key: 'Property_Document',
          setter: (v) => {
            (this.tenantDocumentType = v), this.getTenants();
          },
        },
      ]);
    }
  }

  initTenantSearchListener() {
    this.onTenantsSearch$
      .pipe(debounceTime(1000), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value?.trim()) this.tenantsFilter['search'] = value.trim();
        else delete this.tenantsFilter['search'];

        this.currentPage = 1;
        this.getTenants();
      });
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

  handleViewPdf(leaseId: any): void {
    if (!leaseId) {
      this.alertService.error('Lease ID not found.');
      return;
    }
    // const lease_id = Number(this.route.snapshot.paramMap.get('lease_id'));
    this.tenantsService
      .getLeasePdf(leaseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          const pdfUrl = resp?.content?.pdf_url;

          if (pdfUrl) {
            window.open(pdfUrl, '_blank');
          } else {
            this.alertService.error('PDF URL not found.');
          }
        },
        error: () => {
          this.alertService.error('Failed to open PDF preview.');
        },
      });
  }

  handleExportClick(): void {
    this.tenantsService
      .getExcelFileOfTenant({})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          const url = window.URL.createObjectURL(resp);

          const a = document.createElement('a');
          a.href = url;
          a.download = 'tenant_export.csv';
          a.click();

          window.URL.revokeObjectURL(url);

          this.alertService.success('File downloaded successfully!');
        },
        error: (err) => {
          this.alertService.error(
            err?.error?.message || 'Failed to download tenant file'
          );
        },
      });
  }

  applyFilter() {
    this.currentPage = 1;
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

    let payload = {
      email: form.value.email,
      invitation_type: form.value.invitation_type,
      property_unit_id: form.value.property_unit_id,
    };
    this.tenantsService
      .addTenantToInvite(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
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

  handleViewClick(tenantID: number): void {
    // this.showDetailView = true;
    this.router.navigate(['/dashboard/tenants/detail/', tenantID]);
  }

  handleBackClick(): void {
    this.showDetailView = false;
    this.router.navigate(['/dashboard/tenants']);
  }

  // ------------------------- Access tenant form data -------------------------

  onTenantSave(component: AddTenantFormComponent, modal: NgbActiveModal) {
    component.submitTenantForm();

    modal.close();
    this.getTenants();
  }

  getTenantDetails(tenantID: number): void {
    this.tenantsService
      .getTenantDetails({ tenant_id: tenantID })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.selectedTenant = resp.content;
        },
        error: (err) => console.error('Detail API Error:', err),
      });
  }
}
