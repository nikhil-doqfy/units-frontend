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

import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { CardTitleComponent } from '../../../shared/component/card-title/card-title.component';
import { TableTitleComponent } from '../../../dashboard/component/table-title/table-title.component';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { PlusIconComponent } from '../../../shared/component/icons/plus-icon/plus-icon.component';
import { BackIconComponent } from '../../component/icons/back-icon/back-icon.component';
import { TablePaginationComponent } from '../../../dashboard/component/table-pagination/table-pagination.component';
import { AddRoleFormComponent } from '../../component/forms/add-role-form/add-role-form.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { SharedService } from '../../../shared.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreadCrumb } from '../../../shared/model/shared.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoleAndPermissionsService } from '../../../services/role-and-permissions.service';

@Component({
  selector: 'app-roles-and-permissions',
  standalone: true,
  imports: [
    CommonModule,
    WhiteCardComponent,
    CardTitleComponent,
    TableTitleComponent,
    TableActionButtonComponent,
    SortingIconComponent,
    TableSelectComponent,
    PlusIconComponent,
    BackIconComponent,
    TablePaginationComponent,
    AddRoleFormComponent,
    TranslateModule,
  ],
  templateUrl: './roles-and-permissions.component.html',
  styleUrl: './roles-and-permissions.component.css',
})
export class RolesAndPermissionsComponent {
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);
  private modalService = inject(NgbModal);

  breadcrumbData: BreadCrumb[] = [];
  currentLanguage = 'en';
  showDetailView: boolean = false;
  isEditMode: boolean = false;
  closeResult: WritableSignal<string> = signal('');

  roles: any[] = [];
  tableLoading = false;
  currentPage = 1;
  pageSize = 10;
  roleForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  constructor(
    private router: Router,
    private roleService: RoleAndPermissionsService,
    private fb: FormBuilder
  ) {
    this.roleForm = this.fb.group({
      name: ['', Validators.required],
    });
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
  }

  ngOnInit(): void {
    this.loadBreadcrumb();
    this.sharedService.initLanguage();

    this.initLanguageListener();

    this.fetchRoles();
  }

  onRefresh() {
    this.fetchRoles();
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
      { label: 'PAGE_TITLE.ROLES_PERMISSIONS', link: '' },
    ]);
  }

  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }

  createRole() {
    if (this.roleForm.invalid) return;

    this.isLoading = true;
    this.roleService.createRole(this.roleForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Role created successfully!';
        this.modalService.dismissAll();

        this.fetchRoles();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Failed to create role.';
      },
    });
  }

  fetchRoles(): void {
    this.tableLoading = true;

    this.roleService
      .getRoles({
        page: this.currentPage,
        limit: this.pageSize,
      })
      .subscribe({
        next: (res) => {
          this.roles = res?.content || [];
          this.tableLoading = false;
        },
        error: () => {
          this.tableLoading = false;
        },
      });
  }

  openAddRoleModal(
    addRoleContent: TemplateRef<any>,
    editMode: boolean = false
  ) {
    this.isEditMode = editMode;
    this.modalService
      .open(addRoleContent, {
        ariaLabelledBy: 'modal-title',
        windowClass: 'mdlCommon mdlSmall',
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

  handleViewClick(): void {
    this.showDetailView = true;
  }

  handleBackClick(): void {
    this.showDetailView = false;
  }
}
