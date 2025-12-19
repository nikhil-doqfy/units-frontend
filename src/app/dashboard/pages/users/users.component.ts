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

import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { PlusIconComponent } from '../../../shared/component/icons/plus-icon/plus-icon.component';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { TablePaginationComponent } from '../../component/table-pagination/table-pagination.component';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { AddUserFormComponent } from '../../component/forms/add-user-form/add-user-form.component';
import { UserService } from '../../../user/services/user.service';
import { pipe, Subject, takeUntil } from 'rxjs';
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../shared/model/shared.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../shared.service';
import { AlertService } from '../../../shared/services/alert.service';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { FilterPopupButtonComponent } from '../../component/filter-popup-btn/filter-popup-btn.component';
import { SharedApiService } from '../../../shared/services/shared-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    AddUserFormComponent,
    TableImgItemComponent,
    TranslateModule,
    TableFilterButtonComponent,
    FilterIconComponent,
    CustomSelectComponent,
    FilterPopupButtonComponent,
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

  componentName: string = 'UsersComponent';
  breadcrumbData: BreadCrumb[] = [];
  activeTab: 'all' | 'deleted' = 'all'; // track current tab
  users: any[] = [];
  newUsers: any[] = [];
  deletedUsers: any[] = [];
  selectedFilter: any;
  selectedUserType: any = null;
  selectedUser: any = null;
  userData: Record<string, any> = {};
  totalRecords: number = 0;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;
  currentLanguage = 'en';
  userTypeList: any = [];
  closeResult: WritableSignal<string> = signal('');

  constructor(private router: Router) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
  }

  // ------------------------- call ngOnInit -------------------------
  ngOnInit(): void {
    this.loadBreadcrumb();
    this.sharedService.initLanguage();
    this.initLanguageListener();
    this.getUser();
  }

  initLanguageListener() {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.sharedService.initLanguage();
        this.loadBreadcrumb();
      });
  }

  async loadBreadcrumb() {
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

  onRefresh() {
    this.getUser();
  }

  openAddUserModal(addUserContent: TemplateRef<any>) {
    this.modalService
      .open(addUserContent, {
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

  // ------------------------- Fetched User Details -------------------------
  getUser(): void {
    this.userData = {
      ...this.userData,
      limit: this.rowsPerPage,
      page: this.currentPage,
    };

    this.userService
      .accessUserManagement(this.userData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.users = resp?.content ?? [];
          this.totalRecords = resp?.pagination?.total_records ?? 0;
          this.totalPages = Math.ceil(this.totalRecords / this.rowsPerPage);
        },
      });
  }

  // ------------------------- Fetched Active User Details -------------------------
  getActiveUser() {
    delete this.userData['is_deleted'];
    delete this.userData['start_date'];
    delete this.userData['end_date'];
    this.currentPage = 1;
    this.getUser();
  }

  // ------------------------- Fetched Delated User Details -------------------------
  getDeletedUser(): void {
    delete this.userData['start_date'];
    delete this.userData['end_date'];
    this.userData['is_deleted'] = true;
    this.currentPage = 1;
    this.getUser();
  }

  // ------------------------- Fetched New User Details -------------------------
  getNewUser(): void {
    delete this.userData['is_deleted'];
    this.userData['start_date'] = this.getPrevios30DayDateInEpoch();
    this.userData['end_date'] = new Date().getTime();
    this.currentPage = 1;
    this.getUser();
  }

  // ------------------------- Pagination -------------------------
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

  getPrevios30DayDateInEpoch() {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 30);
    return currentDate.getTime();
  }

  // ------------------------- Access user form data -------------------------

  onUserSave(component: AddUserFormComponent, modal: NgbActiveModal) {
    component.submitUserForm();

    modal.close();

    this.getUser();
  }

  // ------------------------- Delete user from listing -------------------------

  onDeleteClick(userId: any, index: number): void {
    var self = this;
    this.alertService.confirm(this.deleteUserById, userId, self, index);
  }

  deleteUserById(userId: any, self: any, index: number): void {
    self.userService
      .DeleteUser({ user_id: userId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp: any) => {
        if (resp.status === 200) {
          self.alertService.success(resp.message);
          self.users.splice(index, 1);
          self.getUser();
        }
      });
  }

  // ------------------------- User status activate -------------------------

  toggleUserStatus(userId: number): void {
    var data = { user_id: userId };
    this.userService
      .activateUser(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp: any) => {
        if (resp.status == 200) {
          this.alertService.success(resp.message);
        }
      });
  }

  onOptionSelectedFilter(option: string) {
    this.selectedFilter = option;
  }

  // ------------------------- Access user type  -------------------------

  getOptionTypes(options: string[]) {
    this.sharedApiService
      .getOptions({ option_type: options.join(',') })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.userTypeList = response?.content?.user_types;
        },
      });
  }

  handleFilterClick(): void {
    console.log('Filter button clicked');
    this.getOptionTypes(['USER_TYPES']);
  }

  onOptionSelectedUserType(option: any) {
    this.selectedUserType = option;

    if (option && option.value) {
      this.userData['user_type'] = option.key;
    } else {
      delete this.userData['user_type'];
    }
  }

  // ------------ apply form headers filter  ------------
  applyFilter() {
    this.currentPage = 1;
    this.getUser();
  }

  openEditUserModal(userId: number, modalRef: any) {
    this.userService.accessUserManagement({ user_id: userId }).subscribe({
      next: (resp: any) => {
        this.selectedUser = resp?.content?.data[0];

        this.modalService.open(modalRef, {
          ariaLabelledBy: 'modal-title',
          windowClass: 'mdlCommon',
          centered: true,
        });
      },
      error: () => {
        this.alertService.error('Unable to fetch user details');
      },
    });
  }
}
