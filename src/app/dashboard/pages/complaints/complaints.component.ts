import { Component, DestroyRef, inject } from '@angular/core';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { InvitePMCButtonComponent } from '../../component/invite-pmc-btn/invite-pmc-btn.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { TableActionDropdownComponent } from '../../component/table-action-dropdown/table-action-dropdown.component';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TablePaginationComponent } from '../../component/table-pagination/table-pagination.component';
import { Subject } from 'rxjs';
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { SharedService } from '../../../shared.service';
import { AlertService } from '../../../shared/services/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../shared/model/shared.model';
import { CommonModule } from '@angular/common';
import { TableMultiImgItemComponent } from '../../component/table-multi-img-item/table-multi-img-itemcomponent';
import { BadgeComponent } from '../../component/badge/badge.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { StatsCardComponent } from '../../component/stats-card/stats-card.component';
import { CustomSelectComponent } from '../../../auth/component/custom-select/custom-select.component';
import { ArrowComponent } from '../../../shared/component/icons/arrow/arrow.component';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ComplaintsService } from '../../complaints.service';
import { FilterPopupButtonComponent } from '../../component/filter-popup-btn/filter-popup-btn.component';
import { SharedApiService } from '../../../shared/services/shared-api.service';
import { StorageService } from '../../../shared/services/storage.service';
import { UploadDocumentComponent } from '../../component/upload-document/upload-document.component';
import { FileUploadItemComponent } from '../../component/file-upload-item/file-upload-item.component';

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [
    TableTitleComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    TranslateModule,
    TableImgItemComponent,
    TableSelectComponent,
    TablePaginationComponent,
    FilterIconComponent,
    CommonModule,
    TableMultiImgItemComponent,
    BadgeComponent,
    TableActionButtonComponent,
    CustomSelectComponent,
    ArrowComponent,
    FilterPopupButtonComponent,
    UploadDocumentComponent,
    FileUploadItemComponent,
  ],
  templateUrl: './complaints.component.html',
  styleUrl: './complaints.component.css',
})
export class ComplaintsComponent {
  private sharedService = inject(SharedService);
  private alertService = inject(AlertService);
  private complaintService = inject(ComplaintsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  totalRecords: number = 0;
  rowsPerPage: number = 10;
  currentPage: number = 1;
  showDetailView: boolean = false;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  componentName = 'ComplaintsComponent';
  breadcrumbData: BreadCrumb[] = [];
  selected: string = 'Property: All';
  complaintStats = [
    {
      value: '12000',
      label: 'Total Complaints',
      badge: '12% ↑',
      badgeClass: 'greenBadge',
      extra: 'last month',
      extraClass: 'mutedText',
    },
    {
      value: '412',
      label: 'Completed',
    },
    {
      value: '231',
      label: 'In-Progress',
    },
    {
      value: '111',
      label: 'Rejected',
    },
  ];
  private translate = inject(TranslateService);

  private onComplaintsSearch$ = new Subject<string>();
  private USER_ROLE = 'userRole';
  constructor(
    private destroyRef: DestroyRef,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.sharedService.initLanguage();
    this.loadBreadcrumb();
    this.initLanguageListener();

    this.loadComplaints();

    const storedRole = this.storageService.getUserRole();

    console.log('ROLE FROM STORAGE:', storedRole);

    this.role = storedRole ? (storedRole.toUpperCase() as any) : null;
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
      { label: 'PAGE_TITLE.COMPLAINTS', link: '' },
    ]);
  }

  complaintsStatus: any = [];

  selectedComplaintstatus: any = null;
  complaintFilter: Record<string, any> = {};

  private sharedApiService = inject(SharedApiService);
  getOptionTypes(options: string[]) {
    this.sharedApiService
      .getOptions({ option_type: options.join(',') })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.complaintStats = response?.content?.lease_status;
        },
      });
  }

  uploadedImages: any[] = [];

  onUpload(event: any) {
    this.uploadedImages.push(event);
  }

  removeImage(image: any) {
    this.uploadedImages = this.uploadedImages.filter((item) => item !== image);
  }

  onHandleComplaintsStatusClick(): void {
    this.getOptionTypes(['COMPLAINT_STATUS']);
  }
  removeFilter() {
    this.selectedComplaintstatus = null;
    delete this.complaintFilter['lease_status'];
    this.currentPage = 1;
    this.loadComplaints();
  }

  //   onStatusSelected(status: any) {
  //   this.selectedComplaintstatus = status;

  //   this.getComplaints({
  //     status: status.key   // ✔ string
  //   });
  // }

  applyFilter() {
    const params: any = {};
    // this.complaintFilter['lease_status'] = this.complaintsStatus.key;
    if (this.selectedComplaintstatus?.key) {
      params.status = this.selectedComplaintstatus.key;
    }
    this.currentPage = 1;
    this.loadComplaints(params);
  }

  complaints: any[] = [];
  searchTerm: string = '';
  loadComplaints(search?: string) {
    const params: any = {};
    if (search) {
      params.search = search;
    }
    this.complaintService.getComplanints(params).subscribe({
      next: (res) => {
        this.complaints = res.content?.complaints || [];
      },
      error: (err) => console.error('Error fetching complaints:', err),
    });
  }

  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }
  onRefresh() {}

  searchTextChange(search: string): void {
    this.onComplaintsSearch$.next(search);
    this.searchTerm = search; // update current search text
    this.loadComplaints(this.searchTerm);
  }
  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
  }
  onOptionSelected(option: string) {
    this.selected = option;
  }
  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
  }

  //----------------------------------compalint modal --------------------------------------------------
  role: 'OWNER' | 'PMC' | 'TENANT' | null = null;

  showComplaintModal = false;

  get isOwnerOrPmc() {
    return this.role === 'OWNER' || this.role === 'PMC';
  }

  get isTenant() {
    return this.role === 'TENANT';
  }

  openComplaintModal() {
    this.showComplaintModal = true;
  }

  closeComplaintModal() {
    this.showComplaintModal = false;
  }
}
