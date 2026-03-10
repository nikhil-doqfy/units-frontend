import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ticket-aging',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-aging.component.html',
  styleUrl: './ticket-aging.component.css',
})
export class TicketAgingComponent {
  @Input() duration: string | null = null;
  @Input() status: 'success' | 'warning' | 'danger' | 'empty' = 'success';
}
