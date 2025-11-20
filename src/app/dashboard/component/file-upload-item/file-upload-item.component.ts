import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { UploadFileModel } from '../../../shared/model/shared.model';
import { FileService } from '../../../shared/services/file.service';
import { NgSwitch, NgSwitchCase } from '@angular/common';

@Component({
  selector: 'app-file-upload-item',
  standalone: true,
  imports: [NgSwitch, NgSwitchCase],
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
}
