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
import { TicketAgingComponent } from '../../../ticket-aging/ticket-aging.component';
import { AddComplaintsComponent } from '../../component/forms/add-complaints/add-complaints.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditIconComponent } from '../../component/icons/edit-icon/edit-icon.component';
import { DeleteIconComponent } from '../../component/icons/delete-icon/delete-icon.component';

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
    TranslateModule,
    TicketAgingComponent,
    AddComplaintsComponent,
    CommonModule,
    EditIconComponent,
    DeleteIconComponent,
    NoDataComponent,
  ],
  templateUrl: './complaints.component.html',
  styleUrl: './complaints.component.css',
})
export class ComplaintsComponent {
  @ViewChild('searchComp') searchComp!: any;
  @ViewChild('addComplaintContent')
  addComplaintContent!: AddComplaintsComponent;
  @ViewChild(AddComplaintsComponent)
  addComplaintComponent!: AddComplaintsComponent;
  private sharedService = inject(SharedService);
  private alertService = inject(AlertService);
  private complaintService = inject(ComplaintsService);

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private sharedApiService = inject(SharedApiService);
  private onComplaintsSearch$ = new Subject<string>();
  private USER_ROLE = 'userRole';
  private modalService = inject(NgbModal);
  totalRecords: number = 0;
  rowsPerPage: number = 10;
  currentPage: number = 1;
  selectedComplaintForEdit: any = null;
  isEditMode = false;
  selectedComplaint: any = null;
  selectedProperty: any = null;
  @ViewChild('ticketFilterPopup')
  ticketFilterPopup!: FilterPopupButtonComponent;
  showDetailView: boolean = false;
  showMenu = false;
  timelineSummary: any[] = [];
  complaintsStatus: any = [];
  uploadedImages: any[] = [];
  complaints: any[] = [];
  searchTerm: string = '';
  previousComplaints: any[] = [];
  selectedComplaintstatus: any = null;
  complaintFilter: Record<string, any> = {};
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  componentName = 'ComplaintsComponent';
  breadcrumbData: BreadCrumb[] = [];
  selected: string = 'Property: All';
  role: 'OWNER' | 'PMC' | 'TENANT' | null = null;
  showComplaintModal = false;
  showAllPhotos = false;

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
    completed: 0,
    in_progress: 0,
    rejected: 0,
  };
  photos: string[] = [
    '../assets/complaint/complaint-3.png',
    '../assets/complaint/complaint-6.svg',
    'assets/complaint/complaint-7.svg',
    'assets/complaint/complaint-8.svg',
  ];
  assignEnginnerForm!: FormGroup;
  constructor(
    private destroyRef: DestroyRef,
    private storageService: StorageService,
  ) {}

  ngOnInit() {
    this.onComplaintsSearch$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        this.getTickets();
        this.searchComp.onClear();
      });
    this.loadBreadcrumb();

    this.sharedService.initLanguage();
    this.initLanguageListener();
    const storedRole = this.storageService.getUserRole();
    this.role = storedRole ? (storedRole.toUpperCase() as any) : null;
    // this.getTickets();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.showDetailView = true;
      this.loadDetailView(+id);
    } else {
      this.showDetailView = false;
      this.getTickets();
    }
    const code = this.route.snapshot.paramMap.get('code');
    if (code) {
      this.showDetailView = true;
      this.loadComplaintDetailView(code);
    } else {
      this.showDetailView = false;
      this.getTickets();
    }
  }

  clearComplaintStatus(): void {
    this.selectedComplaintstatus = null;
  }
  getLabel(key: string): string {
    return this.translate.instant(key);
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

  getTickets() {
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

    this.complaintService.getTickets(params).subscribe({
      next: (res) => {
        this.complaints = res.content || [];
        this.totalRecords = res?.pagination?.total_records ?? 0;
        this.sharedService.setComplaintCount(this.totalRecords);
        if (res?.pagination?.stats) {
          this.summary = res?.pagination?.stats ?? this.summary;
        }
      },

      error: (err) => console.error('Error fetching complaints:', err),
    });
  }
  // handleViewClick(item: any): void {
  //   this.selectedProperty = item;
  //   this.showDetailView = true;
  // }
  // handleViewClick(ticketID: number): void {
  //   // this.showDetailView = true;
  //   this.router.navigate(['/dashboard/ticket/detail/', ticketID]);
  // }
  handleBackClick(): void {
    this.showDetailView = false;
    this.selectedProperty = null;
    this.router.navigate(['/dashboard/complaints']);
  }
  searchTextChange(search: string): void {
    this.searchTerm = search;
    this.onComplaintsSearch$.next(search);
  }

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
  // applyFilter() {
  //   this.currentPage = 1;
  //   this.getTickets();
  // }

  applyFilter() {
    this.currentPage = 1;

    this.getTickets();

    setTimeout(() => {
      this.ticketFilterPopup?.closePopup();
    });
  }

  removeFilter() {
    this.selectedComplaintstatus = null;
    this.currentPage = 1;
    this.getTickets();
  }

  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }
  onRefresh() {
    this.getTickets();
  }

  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.getTickets();
  }
  onOptionSelected(option: string) {
    this.selected = option;
  }
  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.getTickets();
  }

  //----------------------------------compalint modal --------------------------------------------------

  get isOwnerOrPmc() {
    return this.role === 'OWNER' || this.role === 'PMC';
  }

  get isTenant() {
    return this.role === 'TENANT';
  }

  closeComplaintModal() {
    this.showComplaintModal = false;
  }
  openComplaintModal() {
    this.isEditMode = false;
    this.selectedComplaint = null;

    const modalRef = this.modalService.open(this.addComplaintContent, {
      centered: true,
      size: 'lg',
      backdrop: true,
    });
  }

  onComplaintCreated(success: boolean, modal: any): void {
    if (!success) return;

    modal.close('Complaint created');
    this.getTickets();
  }

  //--------------------------------------------complaint details--------------------------------------------------------------------
  loadDetailView(ticketID: number): void {
    this.complaintService
      .getTicketsDetails({ ticket_id: ticketID })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          // this.selectedcomplaint = resp.content;
        },
        error: (err) => console.error('Detail API Error:', err),
      });
  }
  //------Edit Complaint model--------------

  openEditComplaint(item: any) {
    this.isEditMode = true;
    this.selectedComplaint = item;

    const modalRef = this.modalService.open(this.addComplaintContent, {
      centered: true,
      size: 'lg',
      backdrop: true,
      windowClass: 'complaint-modal-window',
    });
  }
  onDeleteClick(item: any): void {
    if (!item?.code) return;

    if (!confirm('Are you sure you want to delete this complaint?')) return;

    this.complaintService.deleteComplaint(item.code).subscribe({
      next: () => {
        this.getTickets(); // refresh list
      },
      error: (err) => console.error(err),
    });
  }
  /*------complait-detail-----*/

  loadComplaintDetailView(code: string): void {
    this.complaintService
      .getComplaintDetails(code)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.selectedComplaint = resp?.content;
          this.photos =
            this.selectedComplaint?.images?.map(
              (img: any) => img.image || img.url || img,
            ) || [];
          this.previousComplaints =
            this.selectedComplaint?.previous_complaints || [];

          this.timelineSummary = this.selectedComplaint?.timeline_summary || [];
        },
        error: (err) => console.error('Detail API Error:', err),
      });
  }
  handleViewClick(item: any): void {
    this.router.navigate(['/dashboard/complaints/detail', item.code]);
  }
  viewAllPhotos(): void {
    this.showAllPhotos = true;
  }
  loadPreviousComplaints(): void {
    this.loadComplaintDetailView(this.selectedComplaint.code);
  }

  buildParams(): Record<string, any> {
    const params: Record<string, any> = {
      page: this.currentPage,
      limit: this.rowsPerPage,
    };

    if (this.searchTerm) {
      params['search'] = this.searchTerm;
    }

    if (this.selectedComplaintstatus?.key) {
      params['status'] = this.selectedComplaintstatus.key;
    }

    return params;
  }
  handleExport(): void {
    const params = this.buildParams();
    this.complaintService.exportPreviousComplaints(this.buildParams());
  }
}
