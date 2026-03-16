import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-img-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-img-item.component.html',
  styleUrl: './table-img-item.component.css'
})
export class TableImgItemComponent {
  @Input() imgSrc: string = '';

  @Input() img!: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'sm';
  @Input() title!: string;
  @Input() subtitle?: string;
  @Input() clickable: boolean = false;
  @Input() showInitialsFallback: boolean = false;
  @Output() clicked = new EventEmitter<void>();

  get initials(): string {
    if (!this.title) return '?';
    const parts = this.title.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  }

  onClick() {
    if (this.clickable) {
      this.clicked.emit();
    }
  }
}
