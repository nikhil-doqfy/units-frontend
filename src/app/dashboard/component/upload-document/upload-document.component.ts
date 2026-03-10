import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UploadDocIconComponent } from '../icons/upload-doc-icon/upload-doc-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { UploadFileModel } from '../../../shared/model/shared.model';

@Component({
  selector: 'app-upload-document',
  standalone: true,
  imports: [UploadDocIconComponent, TranslateModule],
  templateUrl: './upload-document.component.html',
  styleUrl: './upload-document.component.css',
})
export class UploadDocumentComponent {
  @Input() title = 'DROP_FILES_HERE';
  @Input() isMultipleFiles = false;
  @Input() fileTypes: string[] = ['jpg', 'jpeg', 'png'];
  @Input() maxSize = 20;

  @Output() uploadProgress = new EventEmitter<UploadFileModel>();

  isDragging = false;

  get acceptTypes(): string {
    return this.fileTypes.map((ft) => '.' + ft).join(', ');
  }

  private emitError(file: File, message: string) {
    this.uploadProgress.emit({
      tempId: Date.now() + Math.random(),
      file,
      progress: 0,
      status: 'error',
      errorMessage: message,
    });
  }

  private validateFiles(files: FileList | null): File[] {
    if (!files) return [];

    const maxBytes = this.maxSize * 1024 * 1024;
    const allowed = this.fileTypes.map((ext) => ext.toLowerCase());
    const incoming = Array.from(files);

    if (!this.isMultipleFiles)
      return this.validateSingle(incoming[0], allowed, maxBytes);

    return this.validateMultiple(incoming, allowed, maxBytes);
  }

  private validateSingle(
    file: File,
    allowed: string[],
    maxBytes: number,
  ): File[] {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!allowed.includes(ext)) {
      this.emitError(file, `Invalid file type: .${ext}`);
      return [];
    }

    if (file.size > maxBytes) {
      this.emitError(file, `File too large. Max ${this.maxSize}MB allowed.`);
      return [];
    }

    return [file];
  }

  private validateMultiple(
    files: File[],
    allowed: string[],
    maxBytes: number,
  ): File[] {
    let totalSize = 0;
    const valid: File[] = [];

    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      if (!allowed.includes(ext)) {
        this.emitError(file, `Invalid file type: .${ext}`);
        continue;
      }

      totalSize += file.size;
      if (totalSize > maxBytes) {
        this.emitError(file, `Total size exceeded ${this.maxSize}MB`);
        return [];
      }

      valid.push(file);
    }

    return valid;
  }

  private convertToBase64(
    file: File,
    tempId: number,
  ): Promise<UploadFileModel> {
    return new Promise((resolve) => {
      let progress = 0;
      const reader = new FileReader();

      const emit = (
        p: number,
        status: 'processing' | 'done' | 'error',
        err?: string,
      ) => {
        this.uploadProgress.emit({
          tempId,
          file,
          progress: p,
          status,
          errorMessage: err,
        });
      };

      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 8) + 5;
        if (progress >= 90) progress = 90;
        emit(progress, 'processing');
      }, 120);

      reader.onload = () => {
        clearInterval(interval);
        emit(100, 'done');

        resolve({
          tempId,
          file,
          progress: 100,
          status: 'done',
          base64: reader.result as string,
        });
      };

      reader.onerror = () => {
        clearInterval(interval);
        emit(100, 'error', 'Failed to convert file');

        resolve({
          tempId,
          file,
          progress: 100,
          status: 'error',
          errorMessage: 'Failed to convert file',
        });
      };

      reader.readAsDataURL(file);
    });
  }

  private async processFiles(files: File[]) {
    for (const file of files) {
      const tempId = Date.now() + Math.random();

      this.uploadProgress.emit({
        tempId,
        file,
        progress: 0,
        status: 'pending',
      });

      const result = await this.convertToBase64(file, tempId);

      this.uploadProgress.emit(result);
    }
  }

  /* --------------------------------------------------
     DRAG / DROP / SELECT
  -------------------------------------------------- */
  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
  }

  async onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;

    const files = this.validateFiles(e.dataTransfer?.files || null);
    await this.processFiles(files);
  }

  async onFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = this.validateFiles(input.files);

    await this.processFiles(files);
  }
}
