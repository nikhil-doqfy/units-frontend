import {
  Component,
  DestroyRef,
  inject,
  signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  ModalDismissReasons,
  NgbActiveModal,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';

import { TableTitleComponent } from '../../../dashboard/component/table-title/table-title.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { TableFilterButtonComponent } from '../../../dashboard/component/table-filter-btn/table-filter-btn.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { InvitePMCButtonComponent } from '../../component/invite-pmc-btn/invite-pmc-btn.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { TableActionDropdownComponent } from '../../component/table-action-dropdown/table-action-dropdown.component';
import { ShareIconComponent } from '../../component/icons/share-icon/share-icon.component';
import { ResetIconComponent } from '../../component/icons/reset-icon/reset-icon.component';
import { TablePaginationComponent } from '../../../dashboard/component/table-pagination/table-pagination.component';
import { SendIconComponent } from '../../component/icons/send-icon/send-icon.component';
import { AssignPropertyFormComponent } from '../../component/forms/assign-property-form/assign-property-form.component';
import { TableViewCardComponent } from '../../component/table-view-card/table-view-card.component';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { DocumentTypeItemComponent } from '../../component/document-type-item/document-type-item.component';
import { SortingIconComponent } from '../../component/icons/sorting-icon/sorting-icon.component';
import { TableImgItemComponent } from '../../component/table-img-item/table-img-item.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { debounceTime, Subject } from 'rxjs';
import { PmcService } from '../../services/pmc.service';
import { SharedService } from '../../../shared.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-pmc',
  standalone: true,
  imports: [
    CommonModule,
    TableTitleComponent,
    TableSelectComponent,
    TableSearchComponent,
    TableFilterButtonComponent,
    ExportIconComponent,
    InvitePMCButtonComponent,
    TableActionButtonComponent,
    TableActionDropdownComponent,
    TablePaginationComponent,
    SendIconComponent,
    AssignPropertyFormComponent,
    TableViewCardComponent,
    WhiteCardComponent,
    FilterIconComponent,
    DocumentTypeItemComponent,
    SortingIconComponent,
    TableImgItemComponent,
    TranslateModule,
    NoDataComponent,
  ],
  templateUrl: './pmc.component.html',
  styleUrl: './pmc.component.css',
})
export class PMCComponent {
  private pmcService = inject(PmcService);
  private sharedService = inject(SharedService);
  private alertService = inject(AlertService);
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'PMC', link: '' },
  ];
  private translate = inject(TranslateService);
  private modalService = inject(NgbModal);
  componentName = 'PMCComponent';
  closeResult: WritableSignal<string> = signal('');
  pmcList: any[] = [];
  showDetailView: boolean = false;
  currentLanguage = 'en';
  documentActions = [
    { label: 'Share', icon: ShareIconComponent, action: 'share' },
    { label: 'Reset', icon: ResetIconComponent, action: 'reset' },
  ];

  pmcFilter: Record<string, any> = {};
  totalRecords: number = 0;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;
  private onPMCSearch$ = new Subject<string>();

  constructor(private router: Router, private destroyRef: DestroyRef) {
    this.onPMCSearch$
      .pipe(debounceTime(1000), takeUntilDestroyed(this.destroyRef))
      .subscribe((searchText: string) => {
        if (searchText?.trim()) this.pmcFilter['search'] = searchText.trim();
        else delete this.pmcFilter['search'];

        this.currentPage = 1;
        this.getPMC();
      });
  }

  ngOnInit() {
    const lang = localStorage.getItem('language') || 'en';
    this.currentLanguage = lang;
    this.translate.use(lang);
    const direction = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = direction;

    this.loadBreadcrumb();
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadBreadcrumb());

    this.getPMC();
  }

  async loadBreadcrumb() {
    this.breadcrumbData = await this.sharedService.getBreadcrumbs([
      { key: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
      { key: 'PAGE_TITLE.PMC', link: '' },
    ]);
  }

  getPMC() {
    this.pmcFilter = {
      ...this.pmcFilter,
      limit: this.rowsPerPage,
      page: this.currentPage,
    };
    this.pmcService
      .getPMC(this.pmcFilter)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp: any) => {
        this.pmcList = resp?.content ?? [];
        this.totalRecords = resp?.pagination?.total_records ?? 0;
      });
  }

  onRefresh() {
    this.getPMC();
  }

  searchTextChange(search: string): void {
    this.onPMCSearch$.next(search);
  }

  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.getPMC();
  }

  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.getPMC();
  }

  handleDropdownAction(action: string) {
    console.log(`${action} action clicked`);
  }

  handleExportClick(): void {
    console.log('Export button clicked');
  }

  openAssignPropertyModal(assignPropertyContent: TemplateRef<any>) {
    this.modalService
      .open(assignPropertyContent, {
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

  assignProperty(
    modal: NgbActiveModal,
    component: AssignPropertyFormComponent
  ) {
    const form = component.assignedPrpertyForm;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    let values = form.value;

    let data: any = {
      property_id: values.myProperty.key,
      pmc_id: values.pmc.key,
    };

    this.pmcService
      .editPMC(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp: any) => {
        this.alertService.success(resp.message);
        modal.close('Save click');
      });
  }

  handleEditClick(): void {
    console.log('Edit button clicked');
  }

  handleDeleteClick(): void {
    console.log('Delete button clicked');
  }

  handleViewClick(): void {
    this.showDetailView = true;
  }

  handleBackClick(): void {
    this.showDetailView = false;
  }

  handleDownloadDocumentClick(): void {
    console.log('Download Document button clicked');
  }

  handlePreviewDocumentClick(): void {
    console.log('Preview Document button clicked');
  }
}
