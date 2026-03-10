import { Component, Input } from '@angular/core';
import { TenantProfileSignupIconComponent } from '../../../icons/tenant-profile-signup-icon/tenant-profile-signup-icon.component';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [TenantProfileSignupIconComponent, WhiteCardComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  @Input() form!: FormGroup;
}
