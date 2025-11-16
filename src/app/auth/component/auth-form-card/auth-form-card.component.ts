import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-form-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-form-card.component.html',
  styleUrl: './auth-form-card.component.css',
})
export class AuthFormCardComponent {
  @Input() size: 'small' | 'large' | undefined;

  @Input() customClass: string = '';
}
