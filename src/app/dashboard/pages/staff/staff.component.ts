import { Component, inject, signal, TemplateRef, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { TableTitleComponent } from "../../../dashboard/component/table-title/table-title.component";
import { TableImgItemComponent } from "../../component/table-img-item/table-img-item.component";
import { TableMultiImgItemComponent } from "../../component/table-multi-img-item/table-multi-img-itemcomponent";
import { TableSelectComponent } from "../../component/table-select/table-select.component";
import { TableSearchComponent } from "../../component/table-search/table-search.component";
import { TableFilterButtonComponent } from "../../../dashboard/component/table-filter-btn/table-filter-btn.component";
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { ExportIconComponent } from "../../component/icons/export-icon/export-icon.component";
import { PlusIconComponent } from "../../../shared/component/icons/plus-icon/plus-icon.component";
import { TableActionButtonComponent } from "../../component/table-action-btn/table-action-btn.component";
import { TableActionDropdownComponent } from '../../component/table-action-dropdown/table-action-dropdown.component';
import { ShareIconComponent } from '../../component/icons/share-icon/share-icon.component';
import { ResetIconComponent } from '../../component/icons/reset-icon/reset-icon.component';
import { TablePaginationComponent } from "../../../dashboard/component/table-pagination/table-pagination.component";
import { SortingIconComponent } from "../../component/icons/sorting-icon/sorting-icon.component";
import { AddStaffFormComponent } from "../../component/forms/add-staff-form/add-staff-form.component";
import { TableViewCardComponent } from "../../component/table-view-card/table-view-card.component";
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { OwnerService } from '../../services/owner.service';
import { AlertService } from '../../../shared/services/alert.service';
import { StaffService } from '../../services/staff.service';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { MaskPhonePipe } from '../../../shared/pipes/mask-phone.pipe';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, MaskPhonePipe,
    TableTitleComponent, TableImgItemComponent, TableMultiImgItemComponent, TableSelectComponent, TableSearchComponent, TableFilterButtonComponent, FilterIconComponent, ExportIconComponent, PlusIconComponent, TableActionButtonComponent, TableActionDropdownComponent, TablePaginationComponent, SortingIconComponent, AddStaffFormComponent, TableViewCardComponent],
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.css'
})
export class StaffComponent {
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Staff', link: '' },
  ];


  componentName: string = 'StaffComponent';
  selectedStaff: any = null;

  staffRoles: any[] = [];
  staffRolesData: Record<string, any> = {};
  totalRecords: number = 0;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;

  private modalService = inject(NgbModal);
  private staffService = inject(StaffService);
  private alertService = inject(AlertService)
  private route = inject(ActivatedRoute)
  private destroy$ = new Subject<void>();
  private searchTextSubject = new Subject<string>();
  closeResult: WritableSignal<string> = signal('');

  showDetailView: boolean = false;

  documentActions = [
    { label: 'Share', icon: ShareIconComponent, action: 'share' },
    { label: 'Reset', icon: ResetIconComponent, action: 'reset' }
  ];

  constructor(private router: Router) {
    // ------------------------- Search debounce time -------------------------
    this.searchTextSubject
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe((searchText) => {
        if (searchText?.trim()) this.staffRolesData['search'] = searchText.trim();
        else delete this.staffRolesData['search'];

        this.currentPage = 1;
        this.getStaffRoleDetails();
      });
  }


  ngOnInit(): void {
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
  }

  onRefresh() {
    this.getStaffRoleDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  openAddStaffModal(addStaffContent: TemplateRef<any>) {
    this.modalService.open(addStaffContent, { ariaLabelledBy: 'modal-title', windowClass: 'mdlCommon', centered: true }).result.then(
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

    this.staffService.accessStaffRoleDetails(this.staffRolesData).subscribe({
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
    this.searchTextSubject.next(search);
  }

  // ------------------------- Handel show details function -------------------------

  handleViewClick(staffId: number): void {
    this.router.navigate(['/dashboard/staff/detail', staffId]);
  }


  loadDetailView(staffId: number): void {
    this.staffService.accessStaffRoleDetails({ id: staffId }).subscribe({
      next: (resp: any) => {
        this.selectedStaff = resp.content;
      },
      error: (err) => console.error("Detail API Error:", err)
    });
  }

}