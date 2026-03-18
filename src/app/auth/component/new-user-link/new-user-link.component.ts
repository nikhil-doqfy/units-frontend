import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-user-link',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './new-user-link.component.html',
  styleUrl: './new-user-link.component.css'
})
export class NewUserLinkComponent {
  @Input() type: string | undefined;
  constructor(private router: Router) { }
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
  goToNewUser(): void {
    this.router.navigate(['/auth/new-user']);
  }
}
