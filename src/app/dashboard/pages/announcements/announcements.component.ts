import {
  Component,
  DestroyRef,
  inject,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { PlusIconComponent } from '../../../shared/component/icons/plus-icon/plus-icon.component';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { InviteOwnerBtnComponent } from '../../component/invite-owner-btn/invite-owner-btn.component';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TablePaginationComponent } from '../../component/table-pagination/table-pagination.component';
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../shared/model/shared.model';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { CircularCrossBtnIconComponent } from '../../../icons/circular-cross-btn-icon/circular-cross-btn-icon.component';
import { PreviewIconComponent } from '../../component/icons/preview-icon/preview-icon.component';
import { DeleteIconComponent } from '../../component/icons/delete-icon/delete-icon.component';
import { ReportIconComponent } from '../../../icons/report-icon/report-icon.component';
import { ResendIconComponent } from '../../../icons/resend-icon/resend-icon.component';
import { ArrowDownIconComponent } from '../../../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
import { UploadDocIconComponent } from '../../component/icons/upload-doc-icon/upload-doc-icon.component';
import { SharedService } from '../../../shared.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { DownloadIconComponent } from '../../../icons/download-icon/download-icon.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AnnouncementService } from '../../../announcement.service';
import { FormSelectFieldComponent } from '../../../shared/component/form-select-field/form-select-field.component';
import { SharedApiService } from '../../../shared/services/shared-api.service';
import { FileUploadItemComponent } from '../../component/file-upload-item/file-upload-item.component';
import { UploadDocumentComponent } from '../../component/upload-document/upload-document.component';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [
    TranslateModule,
    WhiteCardComponent,
    PlusIconComponent,
    TableTitleComponent,
    ExportIconComponent,
    CommonModule,
    TableFilterButtonComponent,
    TableSearchComponent,
    TableImgItemComponent,
    TableSelectComponent,
    TablePaginationComponent,
    SortingIconComponent,
    CircularCrossBtnIconComponent,
    PreviewIconComponent,
    DeleteIconComponent,
    ReportIconComponent,
    ResendIconComponent,
    ArrowDownIconComponent,
    CustomSelectComponent,
    DownloadIconComponent,
    ReactiveFormsModule,
    FormSelectFieldComponent,
    FileUploadItemComponent,
    UploadDocumentComponent,
  ],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.css',
})
export class AnnouncementsComponent {
  componentName: string = 'AnnouncementsComponent';
  private announcementService = inject(AnnouncementService);
  private sharedApiService = inject(SharedApiService);
  private alertService = inject(AlertService);
  private modalService = inject(NgbModal);
  @ViewChild('reportModal') reportModal!: TemplateRef<any>;
  propertyOptions: { key: number; value: string }[] = [];
  unitOptions: { key: number; value: string; rent?: string }[] = [];
  blockOptions: { key: number; value: string; rent?: string }[] = [];

  // Filter-specific options (separate from create-form options)
  filterBlockOptions: { key: number; value: string }[] = [];
  filterUnitOptions: { key: number; value: string }[] = [];

  // Active filter values
  filterPropertyId: number | null = null;
  filterBlockId: number | null = null;
  filterUnitId: number | null = null;

  // Selected objects for the custom-select (to display label)
  selectedFilterProperty: any = null;
  selectedFilterBlock: any = null;
  selectedFilterUnit: any = null;

  // View Report panel
  showReportPanel: boolean = false;
  selectedReport: any = null;

  totalRecords: number = 0;
  searchText: string = '';
  broadcastData: any[] = [];
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;
  prop: 'logs' | 'sent' | 'scheduled' | 'draft' | 'deleted' | null = 'logs';
  activeTab: 'marketing' | 'ads' = 'marketing';
  private destroyRef = inject(DestroyRef);
  private translate = inject(TranslateService);
  private fb = inject(FormBuilder);
  uploadedBannerImages: any[] = [];

  announcementForm!: FormGroup;
  ngOnInit() {
    this.initializeForm();
    this.loadBreadcrumb();
    this.sharedService.initLanguage();
    this.initLanguageListener();
    this.sharedApiService.getOptionsType([
      {
        param: 'PARENT_PROPERTY',
        key: 'property',
        setter: (v) => (this.propertyOptions = v),
      },
    ]);
    this.initSearchListener();
    this.getBroadcastData();
  }
  private initSearchListener(): void {
    this.onAnnouncementSearch$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((search: string) => {
        this.searchText = search.trim();
        this.currentPage = 1;
        this.getBroadcastData();
      });
  }
  initializeForm() {
    this.announcementForm = this.fb.group({
      title: [''],
      description: [''],
      property: [null],
      block_tower: [null],
      unit: [null],
      priority: [''],
      channels: [[]],
      banner_image: [null],
    });
  }
  showDetailView: boolean = false;

  private sharedService = inject(SharedService);
  breadcrumbData: BreadCrumb[] = [];

  initLanguageListener() {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadBreadcrumb();
      });
  }
  loadBreadcrumb() {
    if (this.showDetailView) {
      this.setBreadCrumb([
        { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
        { label: 'PAGE_TITLE.PROPERTIES', link: '/dashboard/Announcements' },
        { label: 'PROPERTY_DETAILS', link: '' },
      ]);
    } else {
      this.setBreadCrumb([
        { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
        { label: 'PAGE_TITLE.BROADCAST', link: '' },
      ]);
    }
  }
  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }
  changeTab(type: 'logs' | 'sent' | 'scheduled' | 'draft' | 'deleted') {
    this.prop = type;
    this.currentPage = 1;
    this.getBroadcastData();
  }
  onRefresh() {
    this.getBroadcastData();
  }
  private onAnnouncementSearch$ = new Subject<string>();
  searchTextChange(search: string) {
    this.onAnnouncementSearch$.next(search);
  }
  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.getBroadcastData();
  }
  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.getBroadcastData();
  }
  showCreateScreen: boolean = false;

  onPropertySelect(option: any): void {
    this.announcementForm.patchValue({
      property: option?.key ?? null,
      block_tower: null,
      unit: null,
    });
    this.blockOptions = [];
    this.unitOptions = [];
    this.announcementForm.patchValue({ unit_id: null, amount: null });
    if (!option?.key) return;
    this.sharedApiService.getOptionsType([
      {
        param: 'PROPERTY_BLOCK_BY_PROPERTY',
        key: 'property_block',
        setter: (v) => {
          this.blockOptions = v;
        },
        params: {
          property_id: option.key,
        },
      },
    ]);
  }
  onUnitSelect(option: any): void {
    this.announcementForm.patchValue({
      unit: option?.key ?? null,
    });
  }
  onBlockSelect(option: any): void {
    this.announcementForm.patchValue({
      block_tower: option?.key ?? null,
      unit: null,
    });
    this.unitOptions = [];

    if (!option?.key) {
      return;
    }

    this.sharedApiService.getOptionsType([
      {
        param: 'PROPERTY_UNIT_BY_PROPERTY',
        key: 'property_unit',
        setter: (v) => (this.unitOptions = v),
        params: { property_id: option.key },
      },
    ]);
  }
  openCreate() {
    this.showCreateScreen = true;
  }

  // ─── Filter handlers ───────────────────────────────────────────────────────
  onFilterPropertySelect(option: any): void {
    this.selectedFilterProperty = option ?? null;
    this.filterPropertyId = option?.key ?? null;

    // reset dependent filters
    this.filterBlockId = null;
    this.filterUnitId = null;
    this.selectedFilterBlock = null;
    this.selectedFilterUnit = null;
    this.filterBlockOptions = [];
    this.filterUnitOptions = [];

    if (option?.key) {
      this.sharedApiService.getOptionsType([
        {
          param: 'PROPERTY_BLOCK_BY_PROPERTY',
          key: 'property_block',
          setter: (v) => (this.filterBlockOptions = v),
          params: { property_id: option.key },
        },
      ]);
    }

    this.currentPage = 1;
    this.getBroadcastData();
  }

  onFilterBlockSelect(option: any): void {
    this.selectedFilterBlock = option ?? null;
    this.filterBlockId = option?.key ?? null;

    // reset unit
    this.filterUnitId = null;
    this.selectedFilterUnit = null;
    this.filterUnitOptions = [];

    if (option?.key) {
      this.sharedApiService.getOptionsType([
        {
          param: 'PROPERTY_UNIT_BY_PROPERTY',
          key: 'property_unit',
          setter: (v) => (this.filterUnitOptions = v),
          params: { property_id: option.key },
        },
      ]);
    }

    this.currentPage = 1;
    this.getBroadcastData();
  }

  onFilterUnitSelect(option: any): void {
    this.selectedFilterUnit = option ?? null;
    this.filterUnitId = option?.key ?? null;
    this.currentPage = 1;
    this.getBroadcastData();
  }

  clearFilterProperty(): void {
    this.selectedFilterProperty = null;
    this.filterPropertyId = null;
    this.selectedFilterBlock = null;
    this.filterBlockId = null;
    this.selectedFilterUnit = null;
    this.filterUnitId = null;
    this.filterBlockOptions = [];
    this.filterUnitOptions = [];
    this.currentPage = 1;
    this.getBroadcastData();
  }

  clearFilterBlock(): void {
    this.selectedFilterBlock = null;
    this.filterBlockId = null;
    this.selectedFilterUnit = null;
    this.filterUnitId = null;
    this.filterUnitOptions = [];
    this.currentPage = 1;
    this.getBroadcastData();
  }

  clearFilterUnit(): void {
    this.selectedFilterUnit = null;
    this.filterUnitId = null;
    this.currentPage = 1;
    this.getBroadcastData();
  }

  // ─── View Report panel ─────────────────────────────────────────────────────
  openReportPanel(item: any): void {
    this.selectedReport = item;
    this.showReportPanel = true;
    this.modalService.open(this.reportModal, {
      windowClass: 'mdlCommon mdlLarge',
      centered: true,
      backdrop: true,
      scrollable: true,
    });
  }

  closeReportPanel(): void {
    this.showReportPanel = false;
    this.selectedReport = null;
    this.modalService.dismissAll();
  }

  // ─── Resend Failed ─────────────────────────────────────────────────────────
  resendFailed(item: any): void {
    this.announcementService
      .resendBroadcast(item.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.alertService.success('Resent successfully');
          this.getBroadcastData();
        },
        error: (err) => {
          console.error('Resend failed:', err);
          this.alertService.error('Resend failed');
        },
      });
  }
  getBroadcastData(): void {
    const params: Record<string, any> = {
      page: this.currentPage,
      page_size: this.rowsPerPage,
    };

    if (this.searchText?.trim()) {
      params['search'] = this.searchText.trim();
    }

    if (this.filterPropertyId) {
      params['property_id'] = this.filterPropertyId;
    }
    if (this.filterBlockId) {
      params['block_tower_id'] = this.filterBlockId;
    }
    if (this.filterUnitId) {
      params['unit_id'] = this.filterUnitId;
    }

    if (this.prop === 'draft') {
      params['status'] = 'DRAFT';
    } else if (this.prop === 'sent') {
      params['status'] = 'SENT';
    } else if (this.prop === 'scheduled') {
      params['status'] = 'SCHEDULED';
    } else if (this.prop === 'deleted') {
      params['status'] = 'DELETED';
    }

    this.announcementService
      .getAnnouncements(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          console.log('Broadcast response:', response);

          // API response: { content: { content: [...], pagination: { total_count, ... } } }
          const data = response?.content;
          this.broadcastData = data?.content || [];
          this.totalRecords = data?.pagination?.total_count || 0;
        },
        error: (error) => {
          console.error('Failed to fetch broadcast data:', error);
        },
      });
  }
  handleExportClick() {
    const params: Record<string, any> = {};
    this.announcementService
      .exportAnnouncement(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Announcement.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        this.alertService.success('Exported successfully');
      });
  }
  closeCreate() {
    this.showCreateScreen = false;
  }
  onChannelChange(channel: string, event: Event) {
    const checkbox = event.target as HTMLInputElement;

    const channels = this.announcementForm.get('channels')?.value || [];

    if (checkbox.checked) {
      if (!channels.includes(channel)) {
        this.announcementForm.patchValue({
          channels: [...channels, channel],
        });
      }
    } else {
      this.announcementForm.patchValue({
        channels: channels.filter((item: string) => item !== channel),
      });
    }
  }
  onBannerImageUpload(event: any): void {
    console.log('Banner upload:', event);

    if (!event) {
      return;
    }

    const image = Array.isArray(event) ? event[0] : event;

    if (!image) {
      return;
    }

    // Only update once the upload/conversion is complete
    if (image.status !== 'done') {
      return;
    }

    this.uploadedBannerImages = [image];

    this.announcementForm.patchValue({
      banner_image: image.base64 ?? null,
    });

    console.log(
      'Banner image:',
      this.announcementForm.get('banner_image')?.value,
    );
  }
  removeBannerImage(tempId: any): void {
    this.uploadedBannerImages = this.uploadedBannerImages.filter(
      (image) => image.tempId !== tempId,
    );

    this.announcementForm.patchValue({
      banner_image: null,
    });
  }
  createAnnouncement() {
    if (this.announcementForm.invalid) {
      this.announcementForm.markAllAsTouched();
      return;
    }

    const payload = this.announcementForm.value;

    console.log('Broadcast Payload:', payload);

    this.announcementService
      .createAnnouncement(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          console.log('Announcement created successfully:', response);

          this.showCreateScreen = false;
          this.resetAnnouncementForm();
          this.getBroadcastData();
        },

        error: (error) => {
          console.error('Failed to create announcement:', error);
        },
      });
  }
  resetAnnouncementForm() {
    this.announcementForm.reset({
      title: '',
      description: '',
      property: null,
      block_tower: null,
      unit: null,
      priority: 'NORMAL',
      channels: [],
      banner_image: null,
    });
  }
}
