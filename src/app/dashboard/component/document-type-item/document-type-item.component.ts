import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-document-type-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-type-item.component.html',
  styleUrl: './document-type-item.component.css'
})
export class DocumentTypeItemComponent {
  @Input() title!: string;
  @Input() size!: string;

  get fileExtension(): string {
    return this.title?.split('.').pop()?.toLowerCase() || '';
  }

  get icon(): string {
    switch (this.fileExtension) {
      case 'pdf': return 'assets/pdfIcon.png';
      case 'png': return 'assets/pngIcon.png';
      case 'jpg':
      case 'jpeg': return 'assets/jpgIcon.png';
      default: return 'assets/fileIcon.png';
    }
  }
}
