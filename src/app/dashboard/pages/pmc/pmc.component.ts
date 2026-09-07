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
  NgbTooltipModule,
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
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../shared/model/shared.model';
import { AlertService } from '../../../shared/services/alert.service';
import { FilterPopupButtonComponent } from '../../component/filter-popup-btn/filter-popup-btn.component';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { SharedApiService } from '../../../shared/services/shared-api.service';

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
    AssignPropertyFormComponent,
    TableViewCardComponent,
    WhiteCardComponent,
    FilterIconComponent,
    DocumentTypeItemComponent,
    SortingIconComponent,
    TableImgItemComponent,
    TranslateModule,
    NoDataComponent,
    NgbTooltipModule,
    FilterPopupButtonComponent,
    CustomSelectComponent,
  ],
  templateUrl: './pmc.component.html',
  styleUrl: './pmc.component.css',
})
export class PMCComponent {
  private pmcService = inject(PmcService);
  private sharedService = inject(SharedService);
  private alertService = inject(AlertService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private onPropertySearch$ = new Subject<string>();
  breadcrumbData: BreadCrumb[] = [];
  private translate = inject(TranslateService);
  private sharedApiService = inject(SharedApiService);

  private modalService = inject(NgbModal);
  componentName = 'PMCComponent';
  ticketFilterPopup!: FilterPopupButtonComponent;
  closeResult: WritableSignal<string> = signal('');
  pmcList: any[] = [];
  pmcDetail: any = null;
  propertySearchText = '';
  assignedPropertiesTotal = 0;
  showDetailView: boolean = false;
  currentLanguage = 'en';
  tenancyStatus: any = [];
  selectedTenancyStatus: any = null;
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
  assignedProperties: any[] = [];
  constructor(private destroyRef: DestroyRef) {
    this.initPMCSearchListener();
    this.initPropertySearchListener();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.showDetailView = true;
      this.loadDetailView(+id);
      this.getPMC();
    } else {
      this.showDetailView = false;
      this.getPMC();
    }
  }

  ngOnInit() {
    this.loadBreadcrumb();
    this.sharedService.initLanguage();
    this.initLanguageListener();
  }
  initPropertySearchListener() {
    this.onPropertySearch$
      .pipe(debounceTime(1000), takeUntilDestroyed(this.destroyRef))
      .subscribe((searchText: string) => {
        this.propertySearchText = searchText.trim();
        this.currentPage = 1;

        const companyId = this.route.snapshot.paramMap.get('id');

        if (companyId) {
          this.loadDetailView(+companyId);
        }
      });
  }
  propertySearchTextChange(search: string): void {
    this.onPropertySearch$.next(search);
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
      { label: 'PAGE_TITLE.PMC', link: '' },
    ]);
  }

  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
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
        this.pmcList = (resp?.content ?? []).map((item: any) => ({
          ...item,
          property_handling_names: item.property_handling
            ?.map((x: any) => x.name)
            .join(', '),
        }));
      });
  }
  getOptionTypes(options: string[]) {
    this.sharedApiService
      .getOptions({ option_type: options.join(',') })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.tenancyStatus = response?.content?.tenancy_status;
        },
      });
  }
  onHandleTenancyStatusClick(): void {
    this.getOptionTypes(['TENANCY_STATUS']);
  }
  applyFilter(): void {
    this.currentPage = 1;

    const companyId = this.route.snapshot.paramMap.get('id');

    if (companyId) {
      this.loadDetailView(+companyId);
    }

    setTimeout(() => {
      this.ticketFilterPopup?.closePopup();
    });
  }
  removeFilter(): void {
    this.selectedTenancyStatus = null;
    this.currentPage = 1;

    const companyId = this.route.snapshot.paramMap.get('id');

    if (companyId) {
      this.loadDetailView(+companyId);
    }
  }
  onRefresh() {
    this.getPMC();
  }
  getLabel(key: string): string {
    return this.translate.instant(key);
  }
  initPMCSearchListener() {
    this.onPMCSearch$
      .pipe(debounceTime(1000), takeUntilDestroyed(this.destroyRef))
      .subscribe((searchText: string) => {
        if (searchText?.trim()) this.pmcFilter['search'] = searchText.trim();
        else delete this.pmcFilter['search'];

        this.currentPage = 1;
        this.getPMC();
      });
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
    this.pmcService
      .getExcelFileOfPmc({})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          const url = window.URL.createObjectURL(resp);

          const a = document.createElement('a');
          a.href = url;
          a.download = 'pmc_export.csv';
          a.click();

          window.URL.revokeObjectURL(url);

          this.alertService.success('File downloaded successfully!');
        },
        error: (err) => {
          this.alertService.error(err?.error?.message || 'Download failed');
        },
      });
  }

  handleInternalTableExport(): void {
    if (!this.showDetailView) return;

    const payload = {
      company_id: this.route.snapshot.paramMap.get('id'),
    };

    this.pmcService
      .getExcelFileOfPmc(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: Blob) => {
          const url = window.URL.createObjectURL(resp);
          const a = document.createElement('a');
          a.href = url;
          a.download = `assigned_properties_export.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          this.alertService.success('Internal table exported successfully!');
        },
        error: (err) => {
          this.alertService.error(err?.error?.message || 'Export failed');
        },
      });
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

  assignProperty(
    modal: NgbActiveModal,
    component: AssignPropertyFormComponent,
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
        this.getPMC();
      });
  }

  handleEditClick(): void {
    console.log('Edit button clicked');
  }

  handleDeleteClick(): void {
    console.log('Delete button clicked');
  }

  handleViewClick(companyId: number): void {
    if (!companyId && companyId !== 0) {
      console.warn('Invalid companyId:', companyId);
      return;
    }
    this.router.navigate(['/dashboard/pmc/detail/', companyId]);
  }

  handleBackClick(): void {
    this.router.navigate(['/dashboard/pmc']);
  }
  downloadContract(prop: any) {
    const url = prop.pdf_download_url;
    if (!url) {
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agreement.pdf';
    a.target = '_blank';
    a.click();
  }
  viewContract(prop: any) {
    const url = prop.pdf_url;
    if (!url) {
      return;
    }
    window.open(url, '_blank');
  }

  loadDetailView(company_id: number): void {
    const params: Record<string, any> = {
      company_id: company_id,
      limit: this.rowsPerPage,
      page: this.currentPage,
    };

    if (this.propertySearchText) {
      params['search'] = this.propertySearchText;
    }
    if (this.selectedTenancyStatus) {
      params['tenancy_status'] =
        this.selectedTenancyStatus.key || this.selectedTenancyStatus.value;
    }
    this.pmcService
      .getPMC(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.pmcDetail = resp?.content?.company_profile || null;
          this.pmcList = this.pmcDetail ? [this.pmcDetail] : [];
          this.assignedProperties = resp?.content?.properties || [];
          this.assignedPropertiesTotal = resp?.pagination?.total_records || 0;
        },
        error: (err) => {
          console.error('Detail API Error:', err);
        },
      });
  }
}
