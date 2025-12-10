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
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { MaskPhonePipe } from '../../../shared/pipes/mask-phone.pipe';
import { SharedService } from '../../../shared.service';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FilterPopupButtonComponent } from '../../component/filter-popup-btn/filter-popup-btn.component';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { SharedApiService } from '../../../shared/services/shared-api.service';

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
    InviteIconComponent,
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
  ],
  templateUrl: './owners.component.html',
  styleUrl: './owners.component.css',
})
export class OwnersComponent {
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Owners', link: '' },
  ];
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

    // ------------------------- Search debounce time -------------------------
    this.onOwnerSearch$
      .pipe(debounceTime(1000), takeUntilDestroyed(this.destroyRef))
      .subscribe((searchText) => {
        if (searchText?.trim()) this.ownerData['search'] = searchText.trim();
        else delete this.ownerData['search'];

        this.currentPage = 1;
        this.getOwner();
      });

    const id = this.route.snapshot.paramMap.get('id');
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
    this.loadBreadcrumb();
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadBreadcrumb());
  }

  async loadBreadcrumb() {
    this.breadcrumbData = await this.sharedService.getBreadcrumbs([
      { key: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
      { key: 'PAGE_TITLE.OWNERS', link: '' },
    ]);

    const lang = localStorage.getItem('language') || 'en';
    this.currentLanguage = lang;
    this.translate.use(lang);
    const direction = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = direction;
  }

  onRefresh() {
    this.getOwner();
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
          this.owners = resp?.content ?? [];
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

  // ------------------------- Invited by PMC TO Owner -------------------------

  sendInvite(
    inviteFormRef: InviteOwnerFormComponent,
    modal?: NgbActiveModal | any
  ) {
    const form = inviteFormRef.pmcOwnerForm;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    let payload = { email: form.value.email };
    this.ownerService
      .addOwnerToInvite(payload)
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
        a.download = 'property_export.csv';
        a.click();

        window.URL.revokeObjectURL(url);
        this.alertService.success('File downloaded successfully!');
      });
    console.log('Export button clicked');
  }

  handleExportInternalTable() {
    console.log('Selected Owner at export:', this.selectedOwner);
    if (this.selectedOwner?.owner_id) {
      this.alertService.error('Owner not selected');
      return;
    }

    const params = {
      owner_id: this.selectedOwner.owner_id,
    };

    console.log('Export params:', params);

    this.ownerService
      .getExcelFileOfowner(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        console.log('Export response:', resp);

        const url = window.URL.createObjectURL(resp);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'owner_properties_export.xlsx';
        a.click();

        window.URL.revokeObjectURL(url);
        this.alertService.success('File downloaded successfully!');
      });

    console.log('Export button clicked');
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
  handleViewClick(ownerID: number): void {
    this.router.navigate(['/dashboard/owners/detail/', ownerID]);
  }

  refreshDetailsView() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadDetailView(+id);
  }

  loadDetailView(ownerID: number): void {
    this.ownerService
      .getOwnerDetails({
        owner_id: ownerID,
        rental_status: this.ownerData['rental_status'],
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.selectedOwner = resp.content;
        },
        error: (err) => console.error('Detail API Error:', err),
      });
  }
}
