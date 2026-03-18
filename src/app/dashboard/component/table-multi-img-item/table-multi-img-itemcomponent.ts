import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-multi-img-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-multi-img-item.component.html',
  styleUrls: ['./table-multi-img-item.component.css']
})
export class TableMultiImgItemComponent {
  @Input() images: string[] = [];
  @Input() size: 'sm' | 'md' | 'lg' = 'sm';

  get remainingCount(): number {
    return this.images.length > 3 ? this.images.length - 3 : 0;
  }
}
