import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { TableTitleComponent } from '../../../dashboard/component/table-title/table-title.component';
import { BadgeComponent } from '../../component/badge/badge.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { TableFilterButtonComponent } from '../../../dashboard/component/table-filter-btn/table-filter-btn.component';
import { ExportIconComponent } from '../../component/icons/export-icon/export-icon.component';
import { TableActionButtonComponent } from '../../component/table-action-btn/table-action-btn.component';
import { TablePaginationComponent } from '../../../dashboard/component/table-pagination/table-pagination.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { SharedService } from '../../../shared.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BreadCrumb } from '../../../shared/model/shared.model';
import { TenantDocumentUploadComponent } from '../../../tenant-document-upload/tenant-document-upload.component';
import { DocumenattionService } from '../../../service/documenattion.service';
import { ThemeService, UserRole } from '../../../theme.service';

@Component({
  selector: 'app-documentations',
  standalone: true,
  imports: [
    CommonModule,
    TableTitleComponent,
    BadgeComponent,
    TableSelectComponent,
    CustomSelectComponent,
    TableFilterButtonComponent,
    ExportIconComponent,
    TableActionButtonComponent,
    TablePaginationComponent,
    TranslateModule,
    NoDataComponent,
    TenantDocumentUploadComponent,
  ],
  templateUrl: './documentations.component.html',
  styleUrl: './documentations.component.css',
})
export class DocumentationsComponent {
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private sharedService = inject(SharedService);
  private destroyRef = inject(DestroyRef);
  private documenattionService = inject(DocumenattionService);
  private themeService = inject(ThemeService);
  selected: string = 'Falcom city';
  currentLanguage = 'en';
  currentRole: UserRole = 'tenant';
  tenantDocuments: any[] = [];
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Documentations', link: '' },
  ];

  constructor(
    private router: Router,
    private modalService: NgbModal,
  ) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
  }
  ngOnInit() {
    console.log('Current Role =>', this.currentRole);
    this.themeService.currentRole$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((role) => {
        this.currentRole = role;
        console.log('Current Role:', role);
      });
    this.loadBreadcrumb();
    this.sharedService.initLanguage();

    this.initLanguageListener();
    this.getTenantDocuments();
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
  initLanguageListener() {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadBreadcrumb();
      });
  }
  onOptionSelected(option: string) {
    this.selected = option;
  }

  handleExportClick(): void {
    console.log('Export button clicked');
  }

  handleDownloadClick(): void {
    console.log('Download button clicked');
  }

  handlePreviewClick(): void {
    console.log('Preview button clicked');
  }
  isTenantUploadVisible = false;

  showTenantUpload(): void {
    this.isTenantUploadVisible = true;
  }
  getTenantDocuments(): void {
    this.documenattionService.getTenantDocuments().subscribe({
      next: (resp: any) => {
        this.tenantDocuments = resp.content;
      },
    });
  }
  onDocumentUploaded(event: any, modal: any): void {
    console.log(event);
    modal.close();

    this.getTenantDocuments();
  }
  openTenantDocumentUpload(content: any): void {
    this.modalService.open(content, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
  }
  downloadDocument(document: any): void {
    window.open(document.url, '_blank');
  }
  previewDocument(document: any): void {
    window.open(document.url, '_blank');
  }
}
