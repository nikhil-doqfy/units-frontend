import { Component, Input } from '@angular/core';

import { UploadDocIconComponent } from '../icons/upload-doc-icon/upload-doc-icon.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-upload-document',
  standalone: true,
  imports: [UploadDocIconComponent, TranslateModule],
  templateUrl: './upload-document.component.html',
  styleUrl: './upload-document.component.css',
})
export class UploadDocumentComponent {
  @Input() isMultipleFiles: boolean = false;
  @Input() fileTypes: string[] = ['jpg', 'jpeg', 'png'];
  @Input() maxSize: number = 20;

  isDragging = false;

  get acceptTypes(): string {
    return this.fileTypes.map((ft) => '.' + ft).join(', ');
  }

  private validateFiles(files: FileList | null): File[] {
    if (!files) return [];

    const maxBytes = this.maxSize * 1024 * 1024;
    const allowed = this.fileTypes.map((ext) => ext.toLowerCase());

    const validFiles: File[] = [];

    Array.from(files).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      if (!allowed.includes(ext)) {
        console.warn(`Invalid file type: ${file.name}`);
        return;
      }

      if (file.size > maxBytes) {
        console.warn(`File too large: ${file.name}`);
        return;
      }

      validFiles.push(file);
    });

    return validFiles;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    let files = event.dataTransfer?.files || null;
    const validated = this.validateFiles(files);

    console.log('Dropped valid files:', validated);
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    let files = input.files;

    const validated = this.validateFiles(files);

    console.log('Selected valid files:', validated);
  }
}
