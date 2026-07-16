import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UploadDocumentComponent } from '../../dashboard/component/upload-document/upload-document.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { UploadFileModel } from '../../shared/model/shared.model';
import * as XLSX from 'xlsx';

export interface BulkColumn {
  key: string;
  label: string;
}
export interface BulkFilePayload {
  file_name: string;
  file: string;
}
@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [UploadDocumentComponent, TranslateModule, CommonModule],
  templateUrl: './bulk-upload.component.html',
  styleUrl: './bulk-upload.component.css',
})
export class BulkUploadComponent {
  @Input() columns: BulkColumn[] = [];
  @Output() dataImported = new EventEmitter<any[]>();
  @Output() fileSelected = new EventEmitter<BulkFilePayload>();
  uploadedFile?: UploadFileModel;
  parsedRows: any[] = [];
  parseError: string = '';

  sampleCsvDownload() {
    const headers = this.columns.map((c) => c.label);
    const sampleRow = this.columns.map(() => '');
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample');
    XLSX.writeFile(wb, 'sample_blocks.xlsx');
  }

  onBulkUpload(event: UploadFileModel) {
    if (event.status !== 'done') return;
    this.uploadedFile = event;
    this.parseError = '';
    this.parsedRows = [];
    const rawFile = (event as any).file as File;
    const base64 = event.base64 as string;
    if (!base64) return;

    try {
      const binaryStr = atob(base64.split(',')[1] ?? base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const wb = XLSX.read(bytes, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawRows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

      if (rawRows.length < 2) {
        this.parseError = 'File is empty or has no data rows.';
        return;
      }

      const headerRow: string[] = rawRows[0].map((h: any) => String(h));
      const colMap: Record<string, number> = {};
      this.columns.forEach((col) => {
        const idx = headerRow.findIndex(
          (h) => h.toLowerCase() === col.label.toLowerCase(),
        );
        if (idx !== -1) colMap[col.key] = idx;
      });

      this.parsedRows = rawRows
        .slice(1)
        .filter((row) => row.some((cell) => cell !== '' && cell != null))
        .map((row) => {
          const obj: any = {};
          this.columns.forEach((col) => {
            obj[col.key] =
              colMap[col.key] !== undefined ? (row[colMap[col.key]] ?? '') : '';
          });
          return obj;
        });

      this.dataImported.emit(this.parsedRows);
      this.fileSelected.emit({
        file_name: rawFile?.name ?? 'bulk_upload.xlsx',
        file: base64,
      });
    } catch {
      this.parseError = 'Failed to parse file. Please use the sample template.';
    }
  }

  getParsedData(): any[] {
    return this.parsedRows;
  }
}
