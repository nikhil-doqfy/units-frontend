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
import {
  ModalDismissReasons,
  NgbActiveModal,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';

import { TableTitleComponent } from '../../../dashboard/component/table-title/table-title.component';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { TableMultiImgItemComponent } from '../../component/table-multi-img-item/table-multi-img-itemcomponent';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../../dashboard/component/table-filter-btn/table-filter-btn.component';
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { InviteIconComponent } from '../../component/icons/invite-icon/invite-icon.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { TableActionDropdownComponent } from '../../component/table-action-dropdown/table-action-dropdown.component';
import { ShareIconComponent } from '../../component/icons/share-icon/share-icon.component';
import { ResetIconComponent } from '../../component/icons/reset-icon/reset-icon.component';
import { TablePaginationComponent } from '../../../dashboard/component/table-pagination/table-pagination.component';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { InviteOwnerFormComponent } from '../../component/forms/invite-owner-form/invite-owner-form.component';
import { SendIconComponent } from '../../component/icons/send-icon/send-icon.component';
import { TableViewCardComponent } from '../../component/table-view-card/table-view-card.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OwnerService } from '../../services/owner.service';
import { debounceTime, Subject } from 'rxjs';
import { InvitePMCFormComponent } from '../../component/forms/invite-pmc-form/invite-pmc-form.component';
import { AlertService } from '../../../shared/services/alert.service';
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../shared/model/shared.model';
import { MaskPhonePipe } from '../../../shared/pipes/mask-phone.pipe';
import { SharedService } from '../../../shared.service';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FilterPopupButtonComponent } from '../../component/filter-popup-btn/filter-popup-btn.component';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { SharedApiService } from '../../../shared/services/shared-api.service';
import { InviteOwnerBtnComponent } from '../../component/invite-owner-btn/invite-owner-btn.component';

@Component({
  selector: 'app-owners',
  standalone: true,
  imports: [
    CommonModule,
    TableTitleComponent,
    TableImgItemComponent,
    TableMultiImgItemComponent,
    TableSelectComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    FilterIconComponent,
    ExportIconComponent,
    TableActionButtonComponent,
    TableActionDropdownComponent,
    TablePaginationComponent,
    SortingIconComponent,
    InviteOwnerFormComponent,
    SendIconComponent,
    TableViewCardComponent,
    TranslateModule,
    MaskPhonePipe,
    NoDataComponent,
    FilterPopupButtonComponent,
    CustomSelectComponent,
    InviteOwnerBtnComponent,
  ],
  templateUrl: './owners.component.html',
  styleUrl: './owners.component.css',
})
export class OwnersComponent {
  breadcrumbData: BreadCrumb[] = [];
  selectedOwner: any = null;
  private sharedApiService = inject(SharedApiService);
  owners: any[] = [];
  selectedrentalstatus: any = null;
  ownerData: Record<string, any> = {};
  totalRecords: number = 0;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;
  ownerId = 1;
  rentalStatus: any = [];
  private modalService = inject(NgbModal);
  private ownerService = inject(OwnerService);
  private alertService = inject(AlertService);
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);
  private onOwnerSearch$ = new Subject<string>();

  closeResult: WritableSignal<string> = signal('');
  showDetailView: boolean = false;
  currentLanguage = 'en';
  documentActions = [
    { label: 'Share', icon: ShareIconComponent, action: 'share' },
    { label: 'Reset', icon: ResetIconComponent, action: 'reset' },
  ];

  componentName: string = 'OwnersComponent';

  constructor(private router: Router) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
    this.initOwnerSearchListener();

    const id = this.route.snapshot.paramMap.get('owner_id');
    if (id) {
      this.showDetailView = true;
      this.loadDetailView(+id);

      this.getOptionTypes(['RENTAL_STATUS']);
    } else {
      this.showDetailView = false;
      this.getOwner();
    }
  }

  ngOnInit(): void {
    this.sharedService.initLanguage();
    this.loadBreadcrumb();
    this.initLanguageListener();
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
      { label: 'PAGE_TITLE.OWNERS', link: '' },
    ]);
  }

  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }

  onRefresh() {
    this.getOwner();
  }

  sendInvite(
    inviteOwnerFormRef: InviteOwnerFormComponent,
    modal?: NgbActiveModal | any
  ) {
    const form = inviteOwnerFormRef.pmcOwnerForm;
    console.log('Form value:', form.value);

    if (form.invalid) {
      form.markAllAsTouched();
    }

    const payload = {
      email: form.value.email,
      invitation_type: form.value.invitation_type,
      property_unit_id: form.value.property_unit_id,
    };

    console.log('Payload to send:', payload);
    this.ownerService
      .addOwnerToInvite(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          this.alertService.success(resp.message);
          modal?.close('Invite sent');
        },
        error: (err) => {
          this.alertService.error(err.error?.message || 'Invite failed');
        },
      });
  }

  // ------------------------- Fetched owner Details -------------------------
  getOwner(): void {
    this.ownerData = {
      ...this.ownerData,
      limit: this.rowsPerPage,
      page_number: this.currentPage,
    };

    this.ownerService
      .getOwnerDetails(this.ownerData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.owners = (resp?.content ?? []).map((o: any) => {
            const images =
              o.properties?.flatMap((p: any) =>
                p?.image?.data ? [p.image.data] : []
              ) || [];

            return {
              ...o,
              propertyImages: images.length
                ? images
                : ['assets/property/property-img-default.svg'],
            };
          });

          this.totalRecords = resp?.pagination?.total_records ?? 0;
          this.totalPages = Math.ceil(this.totalRecords / this.rowsPerPage);
        },
      });
  }
  applyFilter() {
    this.ownerData['rental_status'] = this.selectedrentalstatus.key;
    this.currentPage = 1;
    this.loadDetailView(this.selectedOwner.id);
  }

  // ------------------------- Pagination component -------------------------
  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.getOwner();
  }

  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.getOwner();
  }

  initOwnerSearchListener() {
    this.onOwnerSearch$
      .pipe(debounceTime(1000), takeUntilDestroyed(this.destroyRef))
      .subscribe((searchText) => {
        if (searchText?.trim()) this.ownerData['search'] = searchText.trim();
        else delete this.ownerData['search'];

        this.currentPage = 1;
        this.getOwner();
      });
  }

  searchTextChange(search: string) {
    this.onOwnerSearch$.next(search);
  }

  // ------------------------- Model -------------------------
  openInviteOwnerModal(inviteOwnerContent: TemplateRef<any>) {
    this.modalService
      .open(inviteOwnerContent, {
        ariaLabelledBy: 'modal-title',
        windowClass: 'mdlCommon mdlSmall',
        centered: true,
      })
      .result.then(
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

  handleEditClick(): void {
    console.log('Edit button clicked');
  }

  handleDeleteClick(): void {
    console.log('Delete button clicked');
  }

  handleBackClick(): void {
    this.router.navigate(['/dashboard/owners']);
  }

  handleDownloadDocumentClick(): void {
    console.log('Download Document button clicked');
  }

  handlePreviewDocumentClick(): void {
    console.log('Preview Document button clicked');
  }

  handleDropdownAction(action: string) {
    console.log(`${action} action clicked`);
  }

  handleViewPdf(leaseId: number): void {
    if (!leaseId) {
      this.alertService.info('No tenant found for this property.');
      return;
    }
    this.ownerService
      .getOwnerPdf(leaseId)
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
  handleDownloadPdf(leaseId: number): void {
    if (!leaseId) {
      this.alertService.info('No tenant found for this property.');
      return;
    }
    this.ownerService
      .getOwnerPdf(leaseId, 'download')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp: any) => {
        const pdfUrl = resp?.content?.pdf_url;
        if (pdfUrl) {
          const a = document.createElement('a');
          a.href = pdfUrl;
          a.download = `lease_${leaseId}.pdf`;
          a.click();
          this.alertService.success('PDF downloaded successfully!');
        } else {
          this.alertService.error('PDF URL not found.');
        }
      });
  }
  handleFilterClick(): void {
    console.log('Filter button clicked');
  }

  handleExportClick(): void {
    this.ownerService
      .getExcelFileOfowner({})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        console.log('response:--->', resp);

        const url = window.URL.createObjectURL(resp);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'owner_export.csv';
        a.click();

        window.URL.revokeObjectURL(url);
        this.alertService.success('File downloaded successfully!');
      });
    console.log('Export button clicked');
  }

  handleInternalTableExport(): void {
    if (!this.showDetailView) return;

    const payload = {
      owner_id: this.selectedOwner.owner_id,
    };

    this.ownerService
      .getExcelFileOfowner(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: Blob) => {
          const url = window.URL.createObjectURL(resp);
          const a = document.createElement('a');
          a.href = url;
          a.download = `assigned_properties_export.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          this.alertService.success('Internal table exported successfully!');
        },
        error: (err) => {
          this.alertService.error(err?.error?.message || 'Export failed');
        },
      });
  }
  getOptionTypes(options: string[]) {
    this.sharedApiService
      .getOptions({ option_type: options.join(',') })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.rentalStatus = response?.content?.rental_status;
          console.log('data', this.rentalStatus);
        },
      });
  }

  removeFilter() {
    this.selectedrentalstatus = null;
    delete this.ownerData['rental_status'];

    this.currentPage = 1;
    this.loadDetailView(this.selectedOwner.id);
  }

  // ------------------------- Handel show details function -------------------------
  handleViewClick(owner_id: number): void {
    this.router.navigate(['/dashboard/owners/detail/', owner_id]);
  }

  refreshDetailsView() {
    const id = this.route.snapshot.paramMap.get('owner_id');
    if (id) this.loadDetailView(+id);
  }

  loadDetailView(owner_id: number): void {
    this.ownerService
      .getOwnerDetails({
        owner_id: owner_id,
        rental_status: this.ownerData['rental_status'],
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.selectedOwner = resp.content.owner_details;
          this.selectedOwner.table = resp?.content?.table || [];
        },
        error: (err) => console.error('Detail API Error:', err),
      });
  }
}
