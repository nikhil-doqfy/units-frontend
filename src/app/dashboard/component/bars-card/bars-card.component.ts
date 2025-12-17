import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-bars-card',
  standalone: true,
  imports: [],
  templateUrl: './bars-card.component.html',
  styleUrl: './bars-card.component.css',
})
export class BarsCardComponent {
  @Input() data: number[] = [];
  months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
}
