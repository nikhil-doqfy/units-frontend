import { Component, DestroyRef, inject, signal, TemplateRef, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';

import { TableTitleComponent } from '../../../dashboard/component/table-title/table-title.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../../dashboard/component/table-filter-btn/table-filter-btn.component';
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { TablePaginationComponent } from '../../../dashboard/component/table-pagination/table-pagination.component';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { FilterPopupButtonComponent } from '../../component/filter-popup-btn/filter-popup-btn.component';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { InviteOwnerBtnComponent } from '../../component/invite-owner-btn/invite-owner-btn.component';

import { OwnerService } from '../../services/owner.service';
import { AlertService } from '../../../shared/services/alert.service';
import { SharedService } from '../../../shared.service';
import { BreadCrumb, PageChange, PageSizeChange } from '../../../shared/model/shared.model';

@Component({
  selector: 'app-owners',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableTitleComponent,
    TableSelectComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    FilterIconComponent,
    ExportIconComponent,
    TableActionButtonComponent,
    TablePaginationComponent,
    SortingIconComponent,
    FilterPopupButtonComponent,
    NoDataComponent,
    InviteOwnerBtnComponent,
    TranslateModule,
  ],
  templateUrl: './owners.component.html',
  styleUrl: './owners.component.css',
})
export class OwnersComponent {
  private ownerService = inject(OwnerService);
  private alertService = inject(AlertService);
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  private destroyRef = inject(DestroyRef);
  private modalService = inject(NgbModal);
  private fb = inject(FormBuilder);

  breadcrumbData: BreadCrumb[] = [];
  owners: any[] = [];
  totalRecords = 0;
  rowsPerPage = 10;
  currentPage = 1;
  totalPages = 1;
  rowsPerPageOptions = [10, 25, 50, 100];
  componentName = 'OwnersComponent';

  closeResult: WritableSignal<string> = signal('');

  // Form for add/edit
  ownerForm!: FormGroup;
  editingOwnerId: number | null = null;
  formLoading = false;

  private searchSubject$ = new Subject<string>();
  private searchText = '';

  constructor() {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
    this.initForm();
    this.initSearchListener();
    this.loadOwners();
  }

  ngOnInit() {
    this.sharedService.getBreadcrumbs([
      { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
      { label: 'PAGE_TITLE.OWNERS', link: '' },
    ]).subscribe((data) => (this.breadcrumbData = data));
  }

  private initForm(owner?: any) {
    this.ownerForm = this.fb.group({
      first_name:          [owner?.first_name ?? ''],
      last_name:           [owner?.last_name ?? ''],
      email:               [owner?.email ?? ''],
      contact_number:      [owner?.contact_number ?? ''],
      emirates_id:         [owner?.emirates_id ?? ''],
      address_line_1:      [owner?.address_line_1 ?? ''],
      address_line_2:      [owner?.address_line_2 ?? ''],
      pin_code:            [owner?.pin_code ?? ''],
      passport_number:     [owner?.passport_number ?? ''],
      passport_expiry_date:[owner?.passport_expiry_date ? String(owner.passport_expiry_date).slice(0, 10) : ''],
      visa_number:         [owner?.visa_number ?? ''],
      visa_expiry_date:    [owner?.visa_expiry_date ? String(owner.visa_expiry_date).slice(0, 10) : ''],
      owner_number:        [owner?.owner_number ?? ''],
      trade_license_number:[owner?.trade_license_number ?? ''],
      license_number:      [owner?.license_number ?? ''],
      license_expiry_date: [owner?.license_expiry_date ? String(owner.license_expiry_date).slice(0, 10) : ''],
      license_issuer:      [owner?.license_issuer ?? ''],
      fax_number:          [owner?.fax_number ?? ''],
      po_box_number:       [owner?.po_box_number ?? ''],
    });
  }

  private initSearchListener() {
    this.searchSubject$
      .pipe(debounceTime(400), takeUntilDestroyed(this.destroyRef))
      .subscribe((text) => {
        this.searchText = text.trim();
        this.currentPage = 1;
        this.loadOwners();
      });
  }

  loadOwners() {
    const params: Record<string, any> = {
      page: this.currentPage,
      page_size: this.rowsPerPage,
    };
    if (this.searchText) params['search'] = this.searchText;

    this.ownerService.getOwners(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.owners = resp?.content ?? [];
          this.totalRecords = resp?.pagination?.total_records ?? 0;
          this.totalPages = resp?.pagination?.total_pages ?? 1;
        },
      });
  }

  onRefresh() { this.loadOwners(); }

  searchTextChange(text: string) { this.searchSubject$.next(text); }

  onPageChange(event: PageChange) {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.loadOwners();
  }

  onPageSizeChange(event: PageSizeChange) {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.loadOwners();
  }

  handleExportClick() {
    const params: Record<string, any> = {};
    if (this.searchText) params['search'] = this.searchText;
    this.ownerService.exportOwners(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'owners.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        this.alertService.success('Exported successfully');
      });
  }

  // ── Add / Edit modal ────────────────────────────────────────
  openAddModal(content: TemplateRef<any>) {
    this.editingOwnerId = null;
    this.initForm();
    this.openModal(content);
  }

  openEditModal(content: TemplateRef<any>, owner: any) {
    this.editingOwnerId = owner.id;
    this.initForm(owner);
    this.openModal(content);
  }

  private openModal(content: TemplateRef<any>) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-title', windowClass: 'mdlCommon', centered: true, size: 'xl' })
      .result.then(
        (result) => this.closeResult.set(`Closed with: ${result}`),
        (reason) => this.closeResult.set(`Dismissed ${this.getDismissReason(reason)}`),
      );
  }

  saveOwner(modal: any) {
    if (this.ownerForm.invalid) { this.ownerForm.markAllAsTouched(); return; }
    this.formLoading = true;
    const payload = { ...this.ownerForm.value };

    const request$ = this.editingOwnerId
      ? this.ownerService.updateOwner({ ...payload, owner_id: this.editingOwnerId })
      : this.ownerService.createOwner(payload);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (resp: any) => {
        this.alertService.success(resp?.message ?? 'Saved');
        this.formLoading = false;
        modal.close('saved');
        this.loadOwners();
      },
      error: (err: any) => {
        this.alertService.error(err?.error?.message ?? 'Failed');
        this.formLoading = false;
      },
    });
  }

  deleteOwner(owner: any) {
    if (!confirm(`Delete owner "${owner.name}"?`)) return;
    this.ownerService.deleteOwner(owner.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.alertService.success(resp?.message ?? 'Deleted');
          this.loadOwners();
        },
        error: (err: any) => this.alertService.error(err?.error?.message ?? 'Delete failed'),
      });
  }

  private getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.ESC: return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK: return 'by clicking on a backdrop';
      default: return `with: ${reason}`;
    }
  }
}
