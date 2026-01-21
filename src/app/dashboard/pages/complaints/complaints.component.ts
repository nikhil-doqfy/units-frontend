import { Component, DestroyRef, inject, ViewChild } from '@angular/core';
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
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
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
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { ArrowComponent } from '../../../shared/component/icons/arrow/arrow.component';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ComplaintsService } from '../../complaints.service';
import { FilterPopupButtonComponent } from '../../component/filter-popup-btn/filter-popup-btn.component';
import { SharedApiService } from '../../../shared/services/shared-api.service';
import { StorageService } from '../../../shared/services/storage.service';
import { UploadDocumentComponent } from '../../component/upload-document/upload-document.component';
import { FileUploadItemComponent } from '../../component/file-upload-item/file-upload-item.component';
import { FormGroup } from '@angular/forms';
import { TableViewCardComponent } from '../../component/table-view-card/table-view-card.component';
import { DisableIconComponent } from '../../../icon/disable-icon/disable-icon.component';
import { RefreshIconComponent } from '../../component/icons/refresh-icon/refresh-icon.component';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';

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
    TableViewCardComponent,
    WhiteCardComponent,
    DisableIconComponent,
    RefreshIconComponent,
    ExportIconComponent,
    SortingIconComponent,
  ],
  templateUrl: './complaints.component.html',
  styleUrl: './complaints.component.css',
})
export class ComplaintsComponent {
  @ViewChild('searchComp') searchComp!: any;
  private sharedService = inject(SharedService);
  private alertService = inject(AlertService);
  private complaintService = inject(ComplaintsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private sharedApiService = inject(SharedApiService);
  private onComplaintsSearch$ = new Subject<string>();
  private USER_ROLE = 'userRole';
  totalRecords: number = 0;
  rowsPerPage: number = 10;
  currentPage: number = 1;
  showDetailView: boolean = false;
  showMenu = false;
  complaintsStatus: any = [];
  uploadedImages: any[] = [];
  complaints: any[] = [];
  searchTerm: string = '';
  selectedComplaintstatus: any = null;
  complaintFilter: Record<string, any> = {};
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  componentName = 'ComplaintsComponent';
  breadcrumbData: BreadCrumb[] = [];
  selected: string = 'Property: All';
  role: 'OWNER' | 'PMC' | 'TENANT' | null = null;
  showComplaintModal = false;
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

  summary = {
    total_complaints: 0,
    total_completed: 0,
    total_in_progress: 0,
    total_rejected: 0,
  };
  assignEnginnerForm!: FormGroup;
  constructor(
    private destroyRef: DestroyRef,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.onComplaintsSearch$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        this.loadComplaints();
        this.searchComp.onClear();
      });
    this.loadBreadcrumb();

    this.sharedService.initLanguage();
    this.initLanguageListener();
    const storedRole = this.storageService.getUserRole();
    this.role = storedRole ? (storedRole.toUpperCase() as any) : null;
    this.loadComplaints();
  }

  changeLanguage(lang: string) {
    this.sharedService.setLanguage(lang);
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
      { label: 'PAGE_TITLE.COMPLAINTS', link: '' },
    ]);
  }

  getOptionTypes(options: string[]) {
    this.sharedApiService
      .getOptions({ option_type: options.join(',') })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.complaintsStatus = response?.content?.complaint_status;
        },
      });
  }

  loadComplaints() {
    const params: any = {
      limit: this.rowsPerPage,
      page: this.currentPage,
    };

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    if (this.selectedComplaintstatus?.key) {
      params.status = this.selectedComplaintstatus.key;
    }

    this.complaintService.getComplanints(params).subscribe({
      next: (res) => {
        this.complaints = res.content?.complaints || [];
        this.totalRecords = res?.pagination?.total_records ?? 0;
        if (res?.content?.summary) {
          this.summary = res.content.summary;
        }
      },

      error: (err) => console.error('Error fetching complaints:', err),
    });
  }
  handleViewClick(item: any): void {
    console.log('CLICKED 👉', item);
    console.log('showDetailView 👉', this.showDetailView);

    this.selectedProperty = item;
    this.showDetailView = true;
  }
  handleBackClick(): void {
    this.showDetailView = false;
    this.selectedProperty = null;
  }
  searchTextChange(search: string): void {
    this.searchTerm = search;
    this.onComplaintsSearch$.next(search);
  }
  photos: string[] = [
    '../assets/complaint/complaint-3.png',
    '../assets/complaint/complaint-6.svg',
    'assets/complaint/complaint-7.svg',
    'assets/complaint/complaint-8.svg',
  ];
  onUpload(event: any) {
    this.uploadedImages.push(event);
  }

  removeImage(image: any) {
    this.uploadedImages = this.uploadedImages.filter((item) => item !== image);
  }
  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  handleExportClick(): void {}
  handleInternalTableExport(): void {}
  onHandleComplaintsStatusClick(): void {
    this.getOptionTypes(['COMPLAINT_STATUS']);
  }
  applyFilter() {
    this.currentPage = 1;
    this.loadComplaints();
  }

  removeFilter() {
    this.selectedComplaintstatus = null;
    this.currentPage = 1;
    this.loadComplaints();
  }

  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }
  onRefresh() {
    this.loadComplaints();
  }

  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.loadComplaints();
  }
  onOptionSelected(option: string) {
    this.selected = option;
  }
  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.loadComplaints();
  }

  //----------------------------------compalint modal --------------------------------------------------

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
  selectedProperty: any = null;
}
