import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.css'
})
export class AuthFormComponent {
  @Input() customClass: string = '';
}
