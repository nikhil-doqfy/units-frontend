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
import { TranslateModule } from '@ngx-translate/core';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { PmcService } from '../../pmc.service';
import { SharedService } from '../../../shared.service';
import { AlertService } from '../../../shared/services/alert.service';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
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
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'PMC', link: '' },
  ];
  selectedPmc: any = null;
  pmcList: any[] = [];
  pmcData: Record<string, any> = {};

  totalRecords: number = 0;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;
  private modalService = inject(NgbModal);
  private pmcService = inject(PmcService);
  private alertService = inject(AlertService);
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);

  private destroy$ = new Subject<void>();
  private onPmcSearch$ = new Subject<string>();
  closeResult: WritableSignal<string> = signal('');

  showDetailView: boolean = false;
  componentName: string = 'PmcComponent';
  documentActions = [
    { label: 'Share', icon: ShareIconComponent, action: 'share' },
    { label: 'Reset', icon: ResetIconComponent, action: 'reset' },
  ];

  constructor(private router: Router) {
    this.onPmcSearch$
      .pipe(debounceTime(1000), takeUntil(this.destroy$))
      .subscribe((searchText) => {
        if (searchText?.trim()) this.pmcData['search'] = searchText.trim();
        else delete this.pmcData['search'];

        this.currentPage = 1;
        this.getpmc();
      });
  }

  ngOnInit(): void {
    this.getpmc();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Detail view
      this.showDetailView = true;
      // this.loadDetailView(+id);
    } else {
      // Listing view
      this.showDetailView = false;
      // this.getpmc();
    }

    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
  }

  onRefresh() {
    this.getpmc();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //--------------------------getpmcDetails--------------------------------------------------------
  getpmc(): void {
    this.pmcData = {
      ...this.pmcData,
      limit: this.rowsPerPage,
      page_number: this.currentPage,
    };

    this.pmcService.getPmcDetails(this.pmcData).subscribe({
      next: (resp: any) => {
        this.pmcList = resp?.content?.pmcList ?? [];
        this.totalRecords = resp?.pagination?.total_records ?? 0;
        this.totalPages = Math.ceil(this.totalRecords / this.rowsPerPage);
      },
    });
  }

  //--------------------------------pagination component----------------------------------------------------
  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.getpmc();
  }

  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.getpmc();
  }

  searchTextChange(search: string) {
    this.onPmcSearch$.next(search);
  }

  //----------------------modal-----------------------------------------------

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

  handleEditClick(): void {
    console.log('Edit button clicked');
  }

  handleDeleteClick(): void {
    console.log('Delete button clicked');
  }

  handleViewClick(pmcID: number): void {
    this.showDetailView = true;
    this.router.navigate(['/dashboard/owners/detail/', pmcID]);
  }

  handleBackClick(): void {
    this.showDetailView = false;
    this.router.navigate(['/dashboard/pmc']);
  }

  handleDownloadDocumentClick(): void {
    console.log('Download Document button clicked');
  }

  handlePreviewDocumentClick(): void {
    console.log('Preview Document button clicked');
  }

  // loadDetailView(pmcID: number): void {
  //   this.pmcService.getPmcDetails({ pmc_id: pmcID }).subscribe({
  //     next: (resp: any) => {
  //       this.selectedPmc = resp.content;
  //     },
  //     error: (err) => console.error('Detail API Error:', err),
  //   });
  // }
}
