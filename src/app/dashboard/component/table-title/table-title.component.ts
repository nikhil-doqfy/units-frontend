import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RefreshIconComponent } from '../../component/icons/refresh-icon/refresh-icon.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-table-title',
  standalone: true,
  imports: [CommonModule, RefreshIconComponent, TranslateModule],
  templateUrl: './table-title.component.html',
  styleUrl: './table-title.component.css',
})
export class TableTitleComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'sm';
  @Input() title!: string;
  @Input() subtitle!: string;
  @Output() onRefresh = new EventEmitter<void>();
}
