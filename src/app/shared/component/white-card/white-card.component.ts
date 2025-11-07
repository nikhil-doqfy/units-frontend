import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-white-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './white-card.component.html',
  styleUrl: './white-card.component.css'
})
export class WhiteCardComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'sm';
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() description?: string;
  @Input() showActions?: boolean = false;
  @Input() customClass?: string = '';
}
