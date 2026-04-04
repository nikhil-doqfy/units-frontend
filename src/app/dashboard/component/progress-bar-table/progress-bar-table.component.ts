import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NoDataComponent } from '../../../no-data/no-data.component';

export interface ProgressRow {
  id: number | string;
  name: string;
  value: number;
  displayValue?: string;
}

@Component({
  selector: 'app-progress-bar-table',
  standalone: true,
  imports: [CommonModule, NgbProgressbarModule, TranslateModule, NoDataComponent],
  templateUrl: './progress-bar-table.component.html',
  styleUrls: ['./progress-bar-table.component.css'],
})
export class ProgressBarTableComponent {
  @Input() rows: ProgressRow[] = [];
}
