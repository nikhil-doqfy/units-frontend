import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-auth-title',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-title.component.html',
  styleUrl: './auth-title.component.css'
})
export class AuthTitleComponent {
  @Input() title: string | undefined;
  @Input() description: string | undefined;
  @Input() customClass = ''; // ✅ Optional custom class input
}
