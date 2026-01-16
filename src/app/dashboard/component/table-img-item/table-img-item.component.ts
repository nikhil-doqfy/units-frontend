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
  @Output() clicked = new EventEmitter<void>();

  onClick() {
    if (this.clickable) {
      this.clicked.emit();
    }
  }
}
