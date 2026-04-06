import {
  Component,
  DestroyRef,
  inject,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
import { NoDataComponent } from '../../../no-data/no-data.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../shared.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreadCrumb } from '../../../shared/model/shared.model';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    NoDataComponent,
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
  showDetailView = false;
  isEditMode = false;

  readonly MODULES = [
    'Properties',
    'Lead',
    'Tenant',
    'Owner',
    'Cheque',
    'Rental Portfolio',
    'Approval',
    'Complaints',
    'Broadcast',
    'Users',
    'Team',
    'Roles and Permission',
  ];

  roles: any[] = [];
  totalRecords = 0;
  tableLoading = false;
  currentPage = 1;
  pageSize = 10;
  componentName = 'RolesAndPermissionsComponent';
  roleForm!: FormGroup;
  isLoading = false;
  selectedRole: any = null;

  constructor(
    private roleService: RoleAndPermissionsService,
    private fb: FormBuilder
  ) {
    this.roleForm = this.buildForm([]);
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
  }

  ngOnInit(): void {
    this.loadBreadcrumb();
    this.sharedService.initLanguage();
    this.initLanguageListener();
    this.fetchRoles();
  }

  buildForm(existingPermissions: any[]): FormGroup {
    const permArray = this.MODULES.map((module) => {
      const existing = existingPermissions.find((p) => p.module_name === module);
      return this.fb.group({
        module_name: [module],
        create: [existing?.create ?? false],
        edit: [existing?.edit ?? false],
        delete: [existing?.delete ?? false],
        view: [existing?.view ?? false],
      });
    });
    return this.fb.group({
      name: ['', Validators.required],
      permissions: this.fb.array(permArray),
    });
  }

  get permissionsArray(): FormArray {
    return this.roleForm.get('permissions') as FormArray;
  }

  onRefresh() {
    this.fetchRoles();
  }

  initLanguageListener() {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadBreadcrumb());
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

  saveRole() {
    if (this.roleForm.invalid) return;
    this.isLoading = true;
    const payload = this.roleForm.value;
    if (this.isEditMode && this.selectedRole) {
      this.roleService
        .updateRole({ role_id: this.selectedRole.role_id, name: payload.name, permissions: payload.permissions })
        .subscribe({
          next: () => { this.isLoading = false; this.modalService.dismissAll(); this.fetchRoles(); },
          error: () => { this.isLoading = false; },
        });
    } else {
      this.roleService.createRole(payload).subscribe({
        next: () => { this.isLoading = false; this.modalService.dismissAll(); this.fetchRoles(); },
        error: () => { this.isLoading = false; },
      });
    }
  }

  fetchRoles(): void {
    this.tableLoading = true;
    this.roleService.getRoles({ page: this.currentPage, limit: this.pageSize }).subscribe({
      next: (res) => {
        this.roles = res?.content || [];
        this.totalRecords = res?.pagination?.total_records ?? 0;
        this.tableLoading = false;
      },
      error: () => { this.tableLoading = false; },
    });
  }

  onPageChange(event: any) {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.fetchRoles();
  }

  onPageSizeChange(event: any) {
    if (event.componentName !== this.componentName) return;
    this.pageSize = event.pageSize;
    this.currentPage = 1;
    this.fetchRoles();
  }

  openAddRoleModal(addRoleContent: TemplateRef<any>, editMode = false, role: any = null) {
    this.isEditMode = editMode;
    this.selectedRole = role;
    this.roleForm = this.buildForm(role?.permissions ?? []);
    this.roleForm.patchValue({ name: role?.role_name ?? '' });
    this.modalService
      .open(addRoleContent, { ariaLabelledBy: 'modal-title', windowClass: 'mdlCommon mdlLarge', centered: true })
      .result.then(null, () => {});
  }

  handleViewClick(role: any): void {
    this.selectedRole = role;
    this.showDetailView = true;
  }

  handleBackClick(): void {
    this.showDetailView = false;
  }
}
