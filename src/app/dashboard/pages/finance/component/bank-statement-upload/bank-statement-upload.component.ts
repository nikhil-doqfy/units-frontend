import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { ReconciliationService } from '../../../../services/reconciliation.service';
import { unwrapFinanceEnvelope } from '../../finance-envelope';

interface BankStatementImportContent {
  pmc_id: number;
  created?: number;
}

/**
 * Story 3.1's Finance-owned upload control (AD-9). Does not reuse
 * `dashboard/component/upload-document` -- that component's shape
 * (base64 conversion, image-oriented defaults, simulated progress) does
 * not fit a CSV -> multipart-POST flow. Performs a real multipart POST via
 * `ReconciliationService.uploadBankStatement()`.
 *
 * On success, surfaces the response envelope's own `message`/`created`
 * count via `unwrapFinanceEnvelope` -- never a generic string. On failure,
 * shows no inline message at all: the global `http.interceptor.ts` already
 * toasts the backend's exact `error.message` for any non-2xx response
 * (`AlertService`), so this satisfies the "surface the backend's specific
 * error, not a generic one" requirement without duplicating that same text
 * a second time inline (a dual-surfacing bug found and fixed during review).
 */
@Component({
  selector: 'app-bank-statement-upload',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './bank-statement-upload.component.html',
})
export class BankStatementUploadComponent {
  private reconciliationService = inject(ReconciliationService);
  private destroyRef = inject(DestroyRef);

  @Input() pmcId = '';

  // Lets the host page (Reconciliation Workspace) refresh the
  // suggested-matches queue after a successful import -- newly created
  // statement lines can have new suggestions the queue has no other way
  // to learn about (gap found during Story 3.2's review).
  @Output() uploaded = new EventEmitter<void>();

  selectedFile: File | null = null;
  uploading = false;
  resultMessage: string | null = null;
  createdCount: number | null = null;
  uploadFailed = false;

  onFileSelect(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.resultMessage = null;
    this.createdCount = null;
    this.uploadFailed = false;
  }

  upload(): void {
    if (!this.selectedFile || !this.pmcId || this.uploading) return;

    this.uploading = true;
    this.resultMessage = null;
    this.createdCount = null;
    this.uploadFailed = false;

    this.reconciliationService
      .uploadBankStatement(this.pmcId, this.selectedFile)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          this.uploading = false;
          this.uploadFailed = false;
          const content = unwrapFinanceEnvelope<BankStatementImportContent>(
            resp,
          );
          this.resultMessage = resp?.message ?? null;
          this.createdCount = content?.created ?? null;
          this.uploaded.emit();
        },
        error: () => {
          // No inline error message here: the global http.interceptor.ts
          // already toasts the backend's exact `error.message` for any
          // non-2xx response (AlertService) -- surfacing it a second time
          // inline would show the identical text twice. `uploadFailed`
          // still drives this component's own UI state (e.g. clearing
          // resultMessage, letting the file be re-selected).
          this.uploading = false;
          this.uploadFailed = true;
          this.createdCount = null;
          this.resultMessage = null;
        },
      });
  }
}
