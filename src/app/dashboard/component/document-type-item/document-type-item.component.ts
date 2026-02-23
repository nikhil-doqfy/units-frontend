import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-document-type-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-type-item.component.html',
  styleUrl: './document-type-item.component.css',
})
export class DocumentTypeItemComponent {
  // [x: string]: any;
  @Input() title!: string;
  @Input() subtitle!: string;
  @Input() size!: string;
  @Input() fileUrl!: string;
  @Output() clicked = new EventEmitter<void>();
  @Input() status: 'success' | 'warning' | 'none' = 'none';
  @Input() showReplace = false;
  onClick(): void {
    this.clicked.emit();
  }
  get fileExtension(): string {
    return this.title?.split('.').pop()?.toLowerCase() || '';
  }

  get icon(): string {
    switch (this.fileExtension) {
      case 'pdf':
        return 'assets/pdfIcon.png';
      case 'png':
        return 'assets/pngIcon.png';
      case 'jpg':
      case 'jpeg':
        return 'assets/pngIcon.png';
      default:
        return 'assets/fileIcon.png';
    }
  }
}
