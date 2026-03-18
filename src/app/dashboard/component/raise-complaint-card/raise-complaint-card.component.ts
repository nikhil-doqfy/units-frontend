import { Component } from '@angular/core';

import { MailIconComponent } from '../icons/mail-icon/mail-icon.component';
import { CallIconComponent } from '../icons/call-icon/call-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-raise-complaint-card',
  standalone: true,
  imports: [MailIconComponent, CallIconComponent, TranslateModule],
  templateUrl: './raise-complaint-card.component.html',
  styleUrl: './raise-complaint-card.component.css',
})
export class RaiseComplaintCardComponent {
  constructor(private router: Router) {}
  onCreateComplaint() {
    this.router.navigate(['/dashboard/complaints']);
  }
}
