import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PlusIconComponent } from '../../../shared/component/icons/plus-icon/plus-icon.component';
import { ScannericonComponent } from '../../../icon/scannericon/scannericon.component';

@Component({
  selector: 'app-table-filter-btn',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './table-filter-btn.component.html',
  styleUrl: './table-filter-btn.component.css',
})
export class TableFilterButtonComponent {
  @Input() title: string | undefined;
  @Input() hasIcon?: boolean = false;

  @Output() clicked = new EventEmitter<void>();

  // get leftTitle(): string {
  //   return this.title?.split('|')[0]?.trim() ?? '';
  // }

  // get rightTitle(): string {
  //   return this.title?.split('|')[1]?.trim() ?? '';
  // }
  onClick(): void {
    this.clicked.emit();
  }
}
