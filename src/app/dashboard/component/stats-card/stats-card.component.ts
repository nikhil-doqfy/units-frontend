import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
export interface StatsItem {
  label: string;
  value: string | number;

  badge?: string;
  badgeClass?: string;

  extra?: string;
  extraClass?: string;
}
@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.css',
})
export class StatsCardComponent {
  @Input() title!: string | undefined;
  // @Input() stats: { label: string; value: string | number }[] = [];
  @Input() stats: StatsItem[] = [];
}
