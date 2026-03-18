import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

export interface ProgressRow {
  id: number | string;
  name: string;
  value: number;
}

@Component({
  selector: 'app-progress-bar-table',
  standalone: true,
  imports: [CommonModule, NgbProgressbarModule, TranslateModule],
  templateUrl: './progress-bar-table.component.html',
  styleUrls: ['./progress-bar-table.component.css'],
})
export class ProgressBarTableComponent {
  @Input() rows: ProgressRow[] = [];
}
