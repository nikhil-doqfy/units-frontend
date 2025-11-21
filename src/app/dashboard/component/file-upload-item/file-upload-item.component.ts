import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { UploadFileModel } from '../../../shared/model/shared.model';
import { FileService } from '../../../shared/services/file.service';
import { NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { PdfIconComponent } from '../icons/pdf-icon/pdf-icon.component';
import { PngIconComponent } from '../icons/png-icon/png-icon.component';
import { DeleteIconComponent } from '../icons/delete-icon/delete-icon.component';

@Component({
  selector: 'app-file-upload-item',
  standalone: true,
  imports: [
    NgSwitch,
    NgSwitchCase,
    PdfIconComponent,
    PngIconComponent,
    DeleteIconComponent,
    NgIf,
  ],
  templateUrl: './file-upload-item.component.html',
  styleUrl: './file-upload-item.component.css',
})
export class FileUploadItemComponent {
  private fileService = inject(FileService);

  formatFileSize = this.fileService.formatFileSize;

  @Input() item!: UploadFileModel;
  @Output() remove = new EventEmitter<number>();

  onRemove() {
    this.remove.emit(this.item.id);
  }

  getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || '';
  }
}
