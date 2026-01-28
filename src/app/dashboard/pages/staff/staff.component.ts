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
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../shared/model/shared.model';
import { MaskPhonePipe } from '../../../shared/pipes/mask-phone.pipe';
import { SharedService } from '../../../shared.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { FilterPopupButtonComponent } from '../../component/filter-popup-btn/filter-popup-btn.component';
import { SharedApiService } from '../../../shared/services/shared-api.service';
import { NoDataComponent } from '../../../no-data/no-data.component';
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
    NoDataComponent,
  ],
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.css',
})
export class StaffComponent {
  private modalService = inject(NgbModal);
  private staffService = inject(StaffService);
  private alertService = inject(AlertService);
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  private destroyRef = inject(DestroyRef);
  private translate = inject(TranslateService);
  private sharedApiService = inject(SharedApiService);

  componentName: string = 'StaffComponent';
  breadcrumbData: BreadCrumb[] = [];
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
  private onStaffSearch$ = new Subject<string>();
  closeResult: WritableSignal<string> = signal('');
  currentLanguage = 'en';
  showDetailView: boolean = false;
  documentActions = [
    { label: 'Share', icon: ShareIconComponent, action: 'share' },
    { label: 'Reset', icon: ResetIconComponent, action: 'reset' },
  ];
  assignedProperties: any[] = [];
  constructor(private router: Router) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
    this.initStaffSearchListener();
    const id = this.route.snapshot.paramMap.get('staff_id');
    if (id) {
      this.showDetailView = true;
      this.loadDetailView(+id);
    } else {
      this.showDetailView = false;
      this.getStaffRoleDetails();
    }
  }

  ngOnInit(): void {
    this.loadBreadcrumb();

    this.sharedService.initLanguage();
    this.initLanguageListener();
  }

  getLabel(key: string): string {
    return this.translate.instant(key);
  }
  initLanguageListener() {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadBreadcrumb();
      });
  }

  async loadBreadcrumb() {
    this.setBreadCrumb([
      { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
      { label: 'PAGE_TITLE.STAFF', link: '' },
    ]);
  }

  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }

  onRefresh() {
    this.getStaffRoleDetails();
  }

  handleDropdownAction(action: string) {
    console.log(`${action} action clicked`);
  }

  onUserSave(success: boolean, modal: NgbActiveModal) {
    // component.submitStaffForm();

    // modal.close();
    if (success) {
      modal.close();
      this.getStaffRoleDetails();
    }
  }
  removeFilter() {
    this.selectedstaffRole = null;
    delete this.staffRolesData['role'];

    this.currentPage = 1;
    this.getStaffRoleDetails();
  }

  getOptionTypes(options: string[]) {
    this.sharedApiService
      .getOptions({ option_type: options.join(',') })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.staffRole = response?.content?.role;
        },
      });
  }

  handleInternalTableExport(): void {
    if (!this.showDetailView) return;

    const payload = {
      staff_id: this.selectedStaff.staff_id,
    };

    this.staffService
      .getExcelFileOfStaff(payload)
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
  handleFilterClick(): void {
    console.log('Filter button clicked');
  }

  handleExportClick(): void {
    this.staffService.getExcelFileOfStaff({}).subscribe((resp) => {
      const url = window.URL.createObjectURL(resp);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'staff_export.csv';
      a.click();

      window.URL.revokeObjectURL(url);
      this.alertService.success('File downloaded successfully!');
    });
  }

  applyFilter() {
    this.staffRolesData['role'] = this.selectedstaffRole.key;
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
        },
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

  initStaffSearchListener() {
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

  searchTextChange(search: string) {
    this.onStaffSearch$.next(search);
  }

  // ------------------------- Handel show details function -------------------------

  onhandleSelectClick(): void {
    this.getOptionTypes(['ROLE']);
  }
  handleViewClick(staff_id: number): void {
    this.router.navigate(['/dashboard/staff/detail', staff_id]);
  }

  loadDetailView(staff_id: number): void {
    this.staffService
      .accessStaffRoleDetails({ staff_id: staff_id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.selectedStaff = resp.content;
          this.assignedProperties = resp?.content?.assigned_properties ?? [];
        },
        error: (err) => console.error('Detail API Error:', err),
      });
  }
}
