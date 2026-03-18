import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-rent-card',
  standalone: true,
  imports: [],
  templateUrl: './rent-card.component.html',
  styleUrl: './rent-card.component.css',
})
export class RentCardComponent {
  @Input() data: any;
}
