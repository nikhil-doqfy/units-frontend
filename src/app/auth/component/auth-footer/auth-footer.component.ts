import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { CopyrightIconComponent } from '../icons/copyright-icon/copyright-icon.component';

@Component({
  selector: 'app-auth-footer',
  standalone: true,
  imports: [CopyrightIconComponent],
  templateUrl: './auth-footer.component.html',
  styleUrl: './auth-footer.component.css',
})
export class AuthFooterComponent {
  constructor(private router: Router) {}
  goToLogin(): void {
    this.router.navigate(['auth/login']);
  }
}
