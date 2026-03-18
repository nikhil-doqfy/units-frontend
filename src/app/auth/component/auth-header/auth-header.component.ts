import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { HelpIconComponent } from '../icons/help-icon/help-icon.component';

@Component({
  selector: 'app-auth-header',
  standalone: true,
  imports: [
    HelpIconComponent
  ],
  templateUrl: './auth-header.component.html',
  styleUrls: ['./auth-header.component.css']
})
export class AuthHeaderComponent {
  constructor(private router: Router) { }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
