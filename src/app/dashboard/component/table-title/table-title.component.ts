import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RefreshIconComponent } from "../../component/icons/refresh-icon/refresh-icon.component";

@Component({
  selector: 'app-table-title',
  standalone: true,
  imports: [CommonModule, RefreshIconComponent],
  templateUrl: './table-title.component.html',
  styleUrl: './table-title.component.css'
})
export class TableTitleComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'sm';
  @Input() title!: string;
  @Input() subtitle!: string;
}
