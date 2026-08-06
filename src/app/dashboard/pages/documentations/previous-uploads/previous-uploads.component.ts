import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PdfViewerModule } from 'ng2-pdf-viewer';

import { NoDataComponent } from '../../../../no-data/no-data.component';
import { DocumenattionService } from '../../../../service/documenattion.service';

export interface PreviousUploadDoc {
  id: number;
  document_id?: number;
  title: string;
  file_name: string;
  status: string;
  never_expire: boolean;
  expiry_date: string;
  uploaded_at: string;
  created_at?: string;
  url: string;
  file_url?: string;
  version?: number;
  isLatest?: boolean;
}

@Component({
  selector: 'app-previous-uploads',
  standalone: true,
  imports: [CommonModule, TranslateModule, PdfViewerModule, NoDataComponent],
  templateUrl: './previous-uploads.component.html',
  styleUrl: './previous-uploads.component.css',
})
export class PreviousUploadsComponent implements OnInit, OnChanges {
  private modalService = inject(NgbModal);
  private docService = inject(DocumenattionService);

  @Input() documentId: number | null = null;

  @Input() documents: PreviousUploadDoc[] = [];

  allVersions: PreviousUploadDoc[] = [];
  isLoading = false;

  // ── PDF Preview state ─────────────────────────────────────────────────
  previewUrl: string = '';
  previewFileName: string = '';
  isPdf: boolean = false;

  ngOnInit(): void {
    this.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['documentId'] || changes['documents']) {
      this.load();
    }
  }

  private load(): void {
    if (this.documentId !== null && this.documentId !== undefined) {
      this.fetchFromApi(this.documentId);
    } else if (this.documents.length) {
      this.buildList(this.documents);
    }
  }

  private buildList(raw: any[]): void {
    const normalised: PreviousUploadDoc[] = raw.map((d) => {
      const url = d.url ?? d.file_url ?? d.document_url ?? '';
      let fileName = d.file_name ?? d.title ?? '';

      // If fileName has no extension, try to extract from URL
      if (fileName && !fileName.includes('.') && url) {
        const cleanUrl = url.split('?')[0];
        const ext = cleanUrl.substring(cleanUrl.lastIndexOf('.'));
        if (ext && ext.length >= 2 && ext.length <= 5) {
          fileName = fileName + ext;
        }
      }

      return {
        id: d.id ?? d.document_id ?? 0,
        document_id: d.document_id ?? d.id ?? 0,
        title: d.title ?? d.file_name ?? '',
        file_name: fileName,
        status: d.status ?? '',
        never_expire: d.never_expire ?? d.does_not_expire ?? false,
        expiry_date: d.expiry_date ?? '',
        uploaded_at: d.uploaded_at ?? d.created_at ?? d.start_date ?? '',
        url,
      };
    });

    normalised.sort(
      (a, b) =>
        new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime(),
    );

    const total = normalised.length;
    normalised.forEach((doc, idx) => {
      doc.version = total - idx;
      doc.isLatest = idx === 0;
    });

    this.allVersions = normalised;
  }

  // ── Actions ───────────────────────────────────────────────────────────

  downloadDoc(doc: PreviousUploadDoc): void {
    const url = doc.url || doc.file_url;
    if (!url) return;

    const fileName = doc.file_name || doc.title || 'document';

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.blob();
      })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => {
        window.open(url, '_blank');
      });
  }

  openPreview(doc: PreviousUploadDoc, modal: any): void {
    const url = doc.url || doc.file_url || '';
    if (!url) return;

    const fileName = doc.file_name || doc.title || 'Document';
    this.previewFileName = fileName;
    this.isPdf = fileName.split('.').pop()?.toLowerCase() === 'pdf';
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
        this.modalService.open(modal, {
          centered: true,
          size: 'xl',
          backdrop: 'static',
        });
      })
      .catch(() => {
        // Fallback: use original URL
        this.previewUrl = url;
        this.modalService.open(modal, {
          centered: true,
          size: 'xl',
          backdrop: 'static',
        });
      });
  }

  downloadPreview(): void {
    if (!this.previewUrl) return;
    const fileName = this.previewFileName || 'document';

    fetch(this.previewUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => {
        window.open(this.previewUrl, '_blank');
      });
  }

  // ── Template helpers ──────────────────────────────────────────────────

  isPdfFile(fileName: string): boolean {
    return this.getExtension(fileName) === 'pdf';
  }

  isImageFile(fileName: string): boolean {
    return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(
      this.getExtension(fileName),
    );
  }

  private getExtension(fileName: string): string {
    if (!fileName) return '';
    return fileName.split('.').pop()?.toLowerCase() ?? '';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getDaysUntilExpiry(doc: PreviousUploadDoc): number {
    if (doc.never_expire || !doc.expiry_date) return Infinity;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(doc.expiry_date);
    exp.setHours(0, 0, 0, 0);
    return Math.round(
      (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  getDaysLabel(doc: PreviousUploadDoc): string {
    if (doc.never_expire) return 'Never Expires';
    const d = this.getDaysUntilExpiry(doc);
    if (d > 0) return `${d} days left`;
    if (d === 0) return 'Expires today';
    return 'Expired';
  }

  getDaysClass(doc: PreviousUploadDoc): string {
    if (doc.never_expire) return 'daysPill never';
    const d = this.getDaysUntilExpiry(doc);
    if (d > 30) return 'daysPill safe';
    if (d > 0) return 'daysPill warn';
    return 'daysPill expired';
  }

  isExpiredDoc(doc: PreviousUploadDoc): boolean {
    if (doc.never_expire) return false;
    if (doc.status?.toLowerCase() === 'expired') return true;
    if (!doc.expiry_date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(doc.expiry_date);
    exp.setHours(0, 0, 0, 0);
    return exp < today;
  }
  private fetchFromApi(documentId: number): void {
    this.isLoading = true;
    this.allVersions = [];

    this.docService.getTenantDocumentById(documentId).subscribe({
      next: (response: any) => {
        console.log('Previous Documents API Response', response);

        let raw = response?.content ?? response?.data ?? response ?? [];

        const list: any[] = Array.isArray(raw) ? raw : [raw];

        this.buildList(list);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }
}
