import {
  Component,
  DestroyRef,
  inject,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../shared/model/shared.model';
import { TenantDocumentUploadComponent } from '../../../tenant-document-upload/tenant-document-upload.component';
import { DocumenattionService } from '../../../service/documenattion.service';
import { ThemeService, UserRole } from '../../../theme.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PreviousUploadsComponent } from './previous-uploads/previous-uploads.component';

@Component({
  selector: 'app-documentations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    PdfViewerModule,
    PreviousUploadsComponent,
  ],
  templateUrl: './documentations.component.html',
  styleUrl: './documentations.component.css',
})
export class DocumentationsComponent {
  @ViewChild(TenantDocumentUploadComponent, { static: false })
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private sharedService = inject(SharedService);
  private destroyRef = inject(DestroyRef);
  private documenattionService = inject(DocumenattionService);
  private themeService = inject(ThemeService);

  tenantDocumentUploadComponent!: TenantDocumentUploadComponent;
  selected: string = 'Falcom city';
  currentRole: UserRole = 'tenant';
  tenantDocuments: any[] = [];
  totalRecords: number = 0;
  selectedDocTitle: string = '';
  componentName: string = 'documentations-component';
  rowsPerPage: number = 10;
  currentPage: number = 1;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  selectedDocumentId: number | null = null;

  previewUrl: string = '';
  previewFileName: string = '';
  isPdfPreview: boolean = false;

  selectedDocument: any = null;
  isEditMode = false;
  breadcrumbData: any[] = [];

  constructor(
    private router: Router,
    private modalService: NgbModal,
  ) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
  }

  ngOnInit() {
    this.themeService.currentRole$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((role) => {
        this.currentRole = role;
      });
    this.loadBreadcrumb();
    this.sharedService.initLanguage();
    this.initLanguageListener();
    this.getTenantDocuments();
  }

  loadBreadcrumb() {
    this.setBreadCrumb([
      { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
      { label: 'PAGE_TITLE.DOCUMENTATIONS', link: '' },
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

  onRefresh() {
    this.getTenantDocuments();
  }
  onOptionSelected(option: string) {
    this.selected = option;
  }

  handleExportClick(): void {
    this.documenattionService.exportTenantDocuments().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'tenant-documents.csv';
        link.click();

        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Export failed', err);
      },
    });
  }

  getTenantDocuments(): void {
    this.documenattionService.getTenantDocuments().subscribe({
      next: (resp: any) => {
        this.tenantDocuments = resp.content ?? resp ?? [];
        this.totalRecords =
          resp?.pagination?.total_records ?? this.tenantDocuments.length;
      },
    });
  }

  renewDoc(document: any, content: TemplateRef<any>): void {
    const docId = document.document_id ?? document.id;

    this.documenattionService.getTenantDocumentById(docId).subscribe({
      next: (resp: any) => {
        const raw = resp?.content ?? resp;

        const fetched = Array.isArray(raw) ? raw[0] : raw;

        console.log('Renew Doc API Response:', fetched);

        this.selectedDocument = {
          document_id: fetched.document_id ?? fetched.id ?? docId,
          title: fetched.title ?? fetched.file_name ?? '',
          document_type_id: fetched.document_type_id,
          file_name: fetched.file_name ?? fetched.title ?? '',
          status: fetched.status ?? '',
          never_expire:
            fetched.never_expire ?? fetched.does_not_expire ?? false,
          expiry_date: fetched.expiry_date ?? '',
          url: fetched.url ?? fetched.file_url ?? '',
        };

        this.isEditMode = true;

        const modalRef = this.modalService.open(content, {
          centered: true,
          size: 'lg',
          backdrop: 'static',
        });

        modalRef.shown.subscribe(() => {
          if (this.tenantDocumentUploadComponent) {
            this.tenantDocumentUploadComponent.setDocument(
              this.selectedDocument,
            );
          }
        });
      },
      error: (err) => {
        console.error('Failed to fetch document for renew:', err);
      },
    });
  }
  isExpired(document: any): boolean {
    if (document.never_expire || !document.expiry_date) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(document.expiry_date);
    expiry.setHours(0, 0, 0, 0);

    return expiry < today;
  }
  onDocumentUploaded(event: any, modal: any): void {
    modal.close();
    this.resetUploadMode();
    this.getTenantDocuments();
  }

  openTenantDocumentUpload(content: any): void {
    this.modalService.open(content, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
  }

  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.getTenantDocuments();
  }

  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.getTenantDocuments();
  }

  openDocHistory(document: any, content: any): void {
    this.selectedDocTitle = document.title || document.file_name || '';
    this.selectedDocumentId = document.document_id ?? document.id ?? null;
    this.modalService.open(content, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
    });
  }

  resetUploadMode(): void {
    this.isEditMode = false;
    this.selectedDocument = null;
  }

  previewDocument(document: any, previewModal: any): void {
    const url =
      document.url ??
      document.file_url ??
      document.document_url ??
      document.path ??
      null;

    if (!url) {
      console.warn('No URL found for document preview:', document);
      return;
    }

    const fileName = document.file_name ?? document.title ?? 'Document';
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    this.isPdfPreview = ext === 'pdf';
    this.previewFileName = fileName;
    this.previewUrl = '';

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.blob();
      })
      .then((blob) => {
        if (this.previewUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(this.previewUrl);
        }
        this.previewUrl = URL.createObjectURL(blob);

        this.modalService.open(previewModal, {
          centered: true,
          size: 'xl',
          backdrop: 'static',
        });
      })
      .catch(() => {
        this.previewUrl = url;
        this.modalService.open(previewModal, {
          centered: true,
          size: 'xl',
          backdrop: 'static',
        });
      });
  }

  private setPreview(url: string, fileName: string): void {
    this.previewUrl = url;
    this.previewFileName = fileName;
    const ext = (fileName ?? '').split('.').pop()?.toLowerCase() ?? '';
    this.isPdfPreview = ext === 'pdf';
  }
  downloadDocument(doc: any): void {
    const a = window.document.createElement('a');
    a.href = doc.url;
    a.setAttribute('download', doc.title || 'document');
    a.target = '_self'; // kiwa '_blank'
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  }
  downloadFromUrl(url: string, _fileName: string): void {
    window.open(url, '_blank');
  }

  // ── Template helpers ──────────────────────────────────────────────────────

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getDaysNumber(document: any): number {
    if (document.never_expire || !document.expiry_date) return Infinity;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(document.expiry_date);
    expiry.setHours(0, 0, 0, 0);
    return Math.round(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  getDaysLabel(document: any): string {
    const days = this.getDaysNumber(document);
    if (days === Infinity) return '∞';
    if (days > 0) return `${days} days left`;
    if (days === 0) return 'Expires today';
    return 'Expired';
  }

  getDaysClass(document: any): string {
    const days = this.getDaysNumber(document);
    if (days > 30) return 'daysSafe';
    if (days > 0) return 'daysWarn';
    return 'daysExpired';
  }

  getStatusBadge(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'green';
      case 'expired':
        return 'red';
      case 'inactive':
        return 'orange';
      default:
        return 'green';
    }
  }
}
