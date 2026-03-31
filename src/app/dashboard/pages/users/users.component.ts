import {
  Component,
  DestroyRef,
  inject,
  signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  ModalDismissReasons,
  NgbActiveModal,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';

import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { PlusIconComponent } from '../../../shared/component/icons/plus-icon/plus-icon.component';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { TablePaginationComponent } from '../../component/table-pagination/table-pagination.component';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { FilterPopupButtonComponent } from '../../component/filter-popup-btn/filter-popup-btn.component';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { AddUserFormComponent } from '../../component/forms/add-user-form/add-user-form.component';
import { UserService } from '../../../user/services/user.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../shared.service';
import { AlertService } from '../../../shared/services/alert.service';
import { SharedApiService } from '../../../shared/services/shared-api.service';
import { BreadCrumb, PageChange, PageSizeChange } from '../../../shared/model/shared.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    WhiteCardComponent,
    PlusIconComponent,
    TableTitleComponent,
    TableImgItemComponent,
    TableSelectComponent,
    TableActionButtonComponent,
    TablePaginationComponent,
    SortingIconComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    FilterIconComponent,
    CustomSelectComponent,
    FilterPopupButtonComponent,
    NoDataComponent,
    AddUserFormComponent,
    TranslateModule,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent {
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  private modalService = inject(NgbModal);
  private userService = inject(UserService);
  private alertService = inject(AlertService);
  private sharedApiService = inject(SharedApiService);
  private destroyRef = inject(DestroyRef);
  private translate = inject(TranslateService);
  private searchSubject = new Subject<string>();

  isEditMode = false;
  componentName = 'UsersComponent';
  breadcrumbData: BreadCrumb[] = [];
  activeTab: 'all' | 'active' | 'inactive' = 'all';
  users: any[] = [];
  selectedUserType: any = null;
  selectedUser: any = null;
  userData: Record<string, any> = {};
  totalRecords = 0;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage = 10;
  currentPage = 1;
  userTypeList: any[] = [];
  closeResult: WritableSignal<string> = signal('');

  constructor() {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);

    this.searchSubject
      .pipe(debounceTime(400), takeUntilDestroyed(this.destroyRef))
      .subscribe((text) => {
        if (text) {
          this.userData['search'] = text;
        } else {
          delete this.userData['search'];
        }
        this.currentPage = 1;
        this.getUser();
      });
  }

  ngOnInit(): void {
    this.loadBreadcrumb();
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadBreadcrumb());
    this.getUser();
  }

  loadBreadcrumb() {
    this.setBreadCrumb([
      { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
      { label: 'PAGE_TITLE.USERS', link: '' },
    ]);
  }

  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }

  get activeTableTitle(): string {
    switch (this.activeTab) {
      case 'active':   return 'Active Users';
      case 'inactive': return 'Inactive Users';
      default:         return 'All Users';
    }
  }

  onRefresh() {
    this.getUser();
  }

  onSearch(text: string) {
    this.searchSubject.next(text);
  }

  getUser(): void {
    this.userData = { ...this.userData, limit: this.rowsPerPage, page: this.currentPage };
    this.userService
      .accessUserManagement(this.userData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.users = resp?.content ?? [];
          this.totalRecords = resp?.pagination?.total_records ?? 0;
        },
      });
  }

  // ── Tabs ──────────────────────────────────────────────────────────
  getActiveUser() {
    this.activeTab = 'all';
    delete this.userData['is_active'];
    this.currentPage = 1;
    this.getUser();
  }

  getNewUser(): void {
    this.activeTab = 'active';
    this.userData['is_active'] = true;
    this.currentPage = 1;
    this.getUser();
  }

  getDeletedUser(): void {
    this.activeTab = 'inactive';
    this.userData['is_active'] = false;
    this.currentPage = 1;
    this.getUser();
  }

  // ── Pagination ────────────────────────────────────────────────────
  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.getUser();
  }

  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.getUser();
  }

  // ── Modal ─────────────────────────────────────────────────────────
  openAddUserModal(addUserContent: TemplateRef<any>) {
    this.isEditMode = false;
    this.selectedUser = null;
    this.openModal(addUserContent);
  }

  openEditUserModal(userId: number, modalRef: TemplateRef<any>) {
    this.isEditMode = true;
    this.userService.accessUserManagement({ user_id: userId }).subscribe({
      next: (resp: any) => {
        this.selectedUser = resp?.content?.[0] ?? null;
        this.openModal(modalRef);
      },
      error: () => this.alertService.error('Unable to fetch user details'),
    });
  }

  private openModal(content: TemplateRef<any>) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-title', windowClass: 'mdlCommon', centered: true })
      .result.then(
        (result) => this.closeResult.set(`Closed with: ${result}`),
        (reason) => this.closeResult.set(`Dismissed ${this.getDismissReason(reason)}`),
      );
  }

  private getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.ESC: return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK: return 'by clicking on a backdrop';
      default: return `with: ${reason}`;
    }
  }

  onUserSave(success: boolean, modal: NgbActiveModal) {
    if (success) {
      modal.close();
      this.getUser();
    }
  }

  // ── Filter ────────────────────────────────────────────────────────
  handleFilterClick(): void {
    this.sharedApiService
      .getOptions({ option_type: 'USER_ROLE' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (r) => (this.userTypeList = r?.content?.user_role ?? []) });
  }

  onOptionSelectedUserType(option: any) {
    this.selectedUserType = option;
    if (option?.value) {
      this.userData['role'] = option.key;
    } else {
      delete this.userData['role'];
    }
  }

  applyFilter() {
    this.currentPage = 1;
    this.getUser();
  }

  removeFilter() {
    this.selectedUserType = null;
    delete this.userData['role'];
    this.currentPage = 1;
    this.getUser();
  }

  // ── Status toggle ─────────────────────────────────────────────────
  toggleUserStatus(userId: number): void {
    this.userService
      .activateUser({ user_id: userId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp: any) => {
        if (resp.status === 200) {
          this.alertService.success(resp.message);
          this.getUser();
        }
      });
  }
}
