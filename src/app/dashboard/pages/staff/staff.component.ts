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

import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { TableTitleComponent } from '../../../dashboard/component/table-title/table-title.component';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { TableMultiImgItemComponent } from '../../component/table-multi-img-item/table-multi-img-itemcomponent';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../../dashboard/component/table-filter-btn/table-filter-btn.component';
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { PlusIconComponent } from '../../../shared/component/icons/plus-icon/plus-icon.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { TableActionDropdownComponent } from '../../component/table-action-dropdown/table-action-dropdown.component';
import { ShareIconComponent } from '../../component/icons/share-icon/share-icon.component';
import { ResetIconComponent } from '../../component/icons/reset-icon/reset-icon.component';
import { TablePaginationComponent } from '../../../dashboard/component/table-pagination/table-pagination.component';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { AddStaffFormComponent } from '../../component/forms/add-staff-form/add-staff-form.component';
import { TableViewCardComponent } from '../../component/table-view-card/table-view-card.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime, Subject } from 'rxjs';
import { AlertService } from '../../../shared/services/alert.service';
import { StaffService } from '../../services/staff.service';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { MaskPhonePipe } from '../../../shared/pipes/mask-phone.pipe';
import { SharedService } from '../../../shared.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { FilterPopupButtonComponent } from '../../component/filter-popup-btn/filter-popup-btn.component';
import { SharedApiService } from '../../../shared/services/shared-api.service';
@Component({
  selector: 'app-staff',
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
    PlusIconComponent,
    TableActionButtonComponent,
    TableActionDropdownComponent,
    TablePaginationComponent,
    SortingIconComponent,
    AddStaffFormComponent,
    TableViewCardComponent,
    TranslateModule,
    MaskPhonePipe,
    TranslateModule,
    FilterPopupButtonComponent,
    CustomSelectComponent,
  ],
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.css',
})
export class StaffComponent {
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Staff', link: '' },
  ];

  componentName: string = 'StaffComponent';
  selectedStaff: any = null;
  selectedstaffRole: any = null;
  staffRoles: any = [];
  staffRolesData: Record<string, any> = {};
  totalRecords: number = 0;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;
  staffRole: any = [];
  private modalService = inject(NgbModal);
  private staffService = inject(StaffService);
  private alertService = inject(AlertService);
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  private destroyRef = inject(DestroyRef);
  private onStaffSearch$ = new Subject<string>();
  private translate = inject(TranslateService);
  private sharedApiService = inject(SharedApiService);
  closeResult: WritableSignal<string> = signal('');
  currentLanguage = 'en';
  showDetailView: boolean = false;

  documentActions = [
    { label: 'Share', icon: ShareIconComponent, action: 'share' },
    { label: 'Reset', icon: ResetIconComponent, action: 'reset' },
  ];

  constructor(private router: Router) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
    // ------------------------- Search debounce time -------------------------
    this.onStaffSearch$
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((searchText) => {
        if (searchText?.trim())
          this.staffRolesData['search'] = searchText.trim();
        else delete this.staffRolesData['search'];

        this.currentPage = 1;
        this.getStaffRoleDetails();
      });
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
      { key: 'PAGE_TITLE.STAFF', link: '' },
    ]);
    const lang = localStorage.getItem('language') || 'en';
    this.currentLanguage = lang;
    this.translate.use(lang);
    const direction = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = direction;
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      // Detail view
      this.showDetailView = true;
      this.loadDetailView(+id);
    } else {
      // Listing view
      this.showDetailView = false;
      this.getStaffRoleDetails();
    }
    this.getOptionTypes(['STAFF_ROLE']);
  }

  onRefresh() {
    this.getStaffRoleDetails();
  }

  handleDropdownAction(action: string) {
    console.log(`${action} action clicked`);
  }
  onOptionSelectedFilter(option: any) {
    this.selectedstaffRole = option;
  }

  getOptionTypes(options: string[]) {
    this.sharedApiService
      .getOptions({ option_type: options.join(',') })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.staffRole = response?.content?.staff_role;
          console.log('data', this.staffRole);
        },
      });
  }
  handleFilterClick(): void {
    console.log('Filter button clicked');
  }

  handleExportClick(): void {
    this.staffService.getExcelFileOfStaff({}).subscribe((resp) => {
      console.log('response:--->', resp);

      const url = window.URL.createObjectURL(resp);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'staff_export.csv';
      a.click();

      window.URL.revokeObjectURL(url);
      this.alertService.success('File downloaded successfully!');
    });

    console.log('Export button clicked');
  }
  applyFilter() {
    this.staffRolesData['staff_role'] = this.selectedstaffRole.key;
    this.currentPage = 1;
    this.getStaffRoleDetails();
  }

  openAddStaffModal(addStaffContent: TemplateRef<any>) {
    this.modalService
      .open(addStaffContent, {
        ariaLabelledBy: 'modal-title',
        windowClass: 'mdlCommon',
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
    this.router.navigate(['/dashboard/staff']);
  }

  handleDownloadDocumentClick(): void {
    console.log('Download Document button clicked');
  }

  handlePreviewDocumentClick(): void {
    console.log('Preview Document button clicked');
  }

  // ------------------------- Fetched Staff Role Details -------------------------
  getStaffRoleDetails(): void {
    this.staffRolesData = {
      ...this.staffRolesData,
      limit: this.rowsPerPage,
      page_number: this.currentPage,
    };

    this.staffService
      .accessStaffRoleDetails(this.staffRolesData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.staffRoles = resp?.content ?? [];
          this.totalRecords = resp?.pagination?.total_records ?? 0;
          this.totalPages = Math.ceil(this.totalRecords / this.rowsPerPage);
        },
      });
  }

  // ------------------------- Pagination component -------------------------
  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.getStaffRoleDetails();
  }

  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.getStaffRoleDetails();
  }

  searchTextChange(search: string) {
    this.onStaffSearch$.next(search);
  }

  // ------------------------- Handel show details function -------------------------

  handleViewClick(staffId: number): void {
    this.router.navigate(['/dashboard/staff/detail', staffId]);
  }

  loadDetailView(staffId: number): void {
    this.staffService
      .accessStaffRoleDetails({ id: staffId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.selectedStaff = resp.content;
        },
        error: (err) => console.error('Detail API Error:', err),
      });
  }
}
