import {
  Component,
  inject,
  signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { TranslateModule } from '@ngx-translate/core';
import { SharedService } from '../../../shared.service';

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
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent {
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Users', link: '' },
  ];
  componentName: string = 'UsersComponent';
  activeTab: 'all' | 'deleted' = 'all'; // track current tab
  users: any[] = [];
  newUsers: any[] = [];
  deletedUsers: any[] = [];

  userData: Record<string, any> = {};
  totalRecords: number = 0;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;

  private modalService = inject(NgbModal);
  private userService = inject(UserService);
  private destroy$ = new Subject<void>();
  closeResult: WritableSignal<string> = signal('');

  constructor(private router: Router) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
  }

  // ------------------------- call ngOnInit -------------------------
  ngOnInit(): void {
    this.getUser();
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
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp: any) => {
          this.users = resp?.content?.data;
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
}
