import {
  Component,
  inject,
  OnInit,
  signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { Router } from '@angular/router';
import { TableSelectComponent } from '../table-select/table-select.component';
import { TablePaginationComponent } from '../table-pagination/table-pagination.component';
import { TableTitleComponent } from '../table-title/table-title.component';
import { TableSearchComponent } from '../table-search/table-search.component';
import { TableFilterButtonComponent } from '../table-filter-btn/table-filter-btn.component';
import { ExportIconComponent } from '../icons/export-icon/export-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, Subject } from 'rxjs';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { CommonModule } from '@angular/common';
import { LeadsService } from '../../services/leads.service';
import { AlertService } from '../../../shared/services/alert.service';
import { CustomSelectComponent } from '../custom-select/custom-select.component';
import { FilterPopupButtonComponent } from '../filter-popup-btn/filter-popup-btn.component';
import { FilterIconComponent } from '../icons/filter-icon/filter-icon.component';
import { TableActionButtonComponent } from '../table-action-btn/table-action-btn.component';
import { TableImgItemComponent } from '../table-img-item/table-img-item.component';
import { BadgeComponent } from '../badge/badge.component';
import { PlatfromBadgeComponent } from '../platfrom-badge/platfrom-badge.component';
import {
  ModalDismissReasons,
  NgbActiveModal,
  NgbDatepicker,
  NgbDatepickerModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { EditLeadsFormComponent } from '../forms/edit-leads-form/edit-leads-form.component';
import { ActivityHistoryFormComponent } from '../forms/activity-history-form/activity-history-form.component';
import { ActivityHistroyIconsComponent } from '../../../icons/activity-histroy-icons/activity-histroy-icons.component';
import { DateIconComponent } from '../icons/date-icon/date-icon.component';
import { CalenderIconComponent } from '../../../icons/calender-icon/calender-icon.component';
import { CircularCrossBtnIconComponent } from '../../../icons/circular-cross-btn-icon/circular-cross-btn-icon.component';
import { SortingIconComponent } from '../icons/sorting-icon/sorting-icon.component';
import { CheckIconComponent } from '../../../icons/check-icon/check-icon.component';
import { ConvertLeadToTenentFromComponent } from '../forms/convert-lead-to-tenent-from/convert-lead-to-tenent-from.component';

@Component({
  selector: 'app-all-leads',
  standalone: true,
  imports: [
    TableSelectComponent,
    TablePaginationComponent,
    TableTitleComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    ExportIconComponent,
    TranslateModule,
    CommonModule,
    FilterPopupButtonComponent,
    FilterIconComponent,
    TableImgItemComponent,
    BadgeComponent,
    TableActionButtonComponent,
    PlatfromBadgeComponent,
    EditLeadsFormComponent,
    ActivityHistoryFormComponent,
    ActivityHistroyIconsComponent,
    NgbDatepickerModule,
    CalenderIconComponent,
    CircularCrossBtnIconComponent,
    SortingIconComponent,
    CheckIconComponent,
    ConvertLeadToTenentFromComponent,
    CustomSelectComponent,
  ],
  templateUrl: './all-leads.component.html',
  styleUrl: './all-leads.component.css',
})
export class AllLeadsComponent implements OnInit {
  private leadsService = inject(LeadsService);
  private alertService = inject(AlertService);
  private search$ = new Subject<string>();
  private modalService = inject(NgbModal);
  private router = inject(Router);
  closeResult: WritableSignal<string> = signal('');

  leads: any[] = [];
  totalRecords: number = 0;
  rowsPerPage: number = 10;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  currentPage: number = 1;
  searchText: string = '';
  selectedLead: any = null;
  showDetailView: boolean = false;
  componentName = 'allLeadsComponent';

  // Filter values
  filterStatus: string = '';
  filterPlatform: string = '';
  filterLeadType: string = '';

  // Filter options
  statusOptions = [
    { key: 'INTERESTED', value: 'Interested' },
    { key: 'NOT_INTERESTED', value: 'Not Interested' },
    { key: 'LEASE_TENANCY', value: 'Lease/Tenancy' },
  ];
  platformOptions = [
    { key: 'PROPERTY_FINDER', value: 'Property Finder' },
    { key: 'BAYUT', value: 'Bayut' },
    { key: 'DIRECT', value: 'Direct' },
    { key: 'REFERRAL', value: 'Referral' },
  ];
  leadTypeOptions = [
    { key: 'EMAIL', value: 'Email' },
    { key: 'WHATSAPP', value: 'WhatsApp' },
    { key: 'CALL', value: 'Call' },
  ];

  isEditMode: boolean = false;

  ngOnInit(): void {
    this.search$.pipe(debounceTime(400)).subscribe((text) => {
      this.searchText = text;
      this.currentPage = 1;
      this.loadLeads();
    });
    this.loadLeads();
  }

  buildParams(): Record<string, any> {
    const params: Record<string, any> = { page: this.currentPage, page_size: this.rowsPerPage };
    if (this.searchText) params['search'] = this.searchText;
    if (this.filterStatus) params['status'] = this.filterStatus;
    if (this.filterPlatform) params['platform'] = this.filterPlatform;
    if (this.filterLeadType) params['lead_type'] = this.filterLeadType;
    return params;
  }

  loadLeads(): void {
    this.leadsService.getLeads(this.buildParams()).subscribe({
      next: (resp: any) => {
        this.leads = resp?.content || [];
        this.totalRecords = resp?.pagination?.total_records ?? this.leads.length;
      },
    });
  }

  onRefresh(): void {
    this.loadLeads();
  }

  searchTextChange(text: string): void {
    this.search$.next(text);
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.loadLeads();
  }

  removeFilter(): void {
    this.filterStatus = '';
    this.filterPlatform = '';
    this.filterLeadType = '';
    this.currentPage = 1;
    this.loadLeads();
  }

  handleExportClick(): void {
    this.leadsService.exportLeads(this.buildParams());
  }

  getPlatformType(platform: string): 'propertyFinder' | 'bayut' | 'direct' | 'referral' {
    const map: Record<string, any> = {
      PROPERTY_FINDER: 'propertyFinder',
      BAYUT: 'bayut',
      DIRECT: 'direct',
      REFERRAL: 'referral',
    };
    return map[platform] || 'direct';
  }

  getStatusBadge(status: string): { title: string; color: string } {
    const map: Record<string, any> = {
      INTERESTED: { title: 'Interested', color: 'green' },
      NOT_INTERESTED: { title: 'Not Interested', color: 'red' },
      LEASE_TENANCY: { title: 'Lease/Tenancy', color: 'blue' },
    };
    return map[status] || { title: status, color: 'grey' };
  }

  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.loadLeads();
  }

  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.loadLeads();
  }

  openEditLeadModal(
    editLeadContent: TemplateRef<any>,
    lead: any = null,
  ) {
    this.selectedLead = lead;
    this.modalService
      .open(editLeadContent, {
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

  openActivityHistroyModal(
    activityHistroyContent: TemplateRef<any>,
    lead: any = null,
  ) {
    this.selectedLead = lead;
    this.modalService
      .open(activityHistroyContent, {
        ariaLabelledBy: 'modal-title',
        windowClass: 'mdlCommon activity-history-modal',
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
  openLeadToTenantModel(convertLeadToTenentContent: TemplateRef<any>, lead: any = null) {
    this.selectedLead = lead;
    this.modalService
      .open(convertLeadToTenentContent, {
        ariaLabelledBy: 'modal-title',
        windowClass: 'mdlCommon convertTenantModal',
        centered: true,

        size: 'lg',
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
  convertToTenancy(modal: NgbActiveModal): void {
    modal.close();
    this.router.navigate(['/dashboard/new-tenant'], {
      queryParams: { lead_id: this.selectedLead?.id },
    });
  }

  onUserSave(success: boolean, modal: NgbActiveModal) {
    if (success) {
      this.alertService.success('Lead saved successfully');
      modal.close();
      this.loadLeads();
    } else {
      this.alertService.error('Failed to save lead');
    }
  }
}
