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
import { CardTitleComponent } from '../../../shared/component/card-title/card-title.component';
import { TableTitleComponent } from '../../../dashboard/component/table-title/table-title.component';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { PlusIconComponent } from '../../../shared/component/icons/plus-icon/plus-icon.component';
import { BackIconComponent } from '../../component/icons/back-icon/back-icon.component';
import { TablePaginationComponent } from '../../../dashboard/component/table-pagination/table-pagination.component';
import { AddRoleFormComponent } from '../../component/forms/add-role-form/add-role-form.component';
import { TranslateModule } from '@ngx-translate/core';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { SharedService } from '../../../shared.service';

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
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Roles & Permissions', link: '' },
  ];

  showDetailView: boolean = false;
  private modalService = inject(NgbModal);
  closeResult: WritableSignal<string> = signal('');

  constructor(private router: Router) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
  }

  openAddRoleModal(addRoleContent: TemplateRef<any>) {
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
