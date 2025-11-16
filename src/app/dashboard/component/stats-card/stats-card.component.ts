import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.css',
})
export class StatsCardComponent {
  @Input() title!: string | undefined;
  @Input() stats: { label: string; value: string | number }[] = [];
}
