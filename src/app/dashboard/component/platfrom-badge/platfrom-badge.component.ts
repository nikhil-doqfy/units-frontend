import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type PlatformType = 'direct' | 'referral' | 'company';
export type CompanyName = 'OPTIEX' | 'DOQFY';
@Component({
  selector: 'app-platfrom-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './platfrom-badge.component.html',
  styleUrl: './platfrom-badge.component.css',
})
export class PlatfromBadgeComponent {
  @Input() platform!: { type: PlatformType; companyName?: CompanyName };

  get displayText(): string {
    if (this.platform.type === 'direct') return 'Direct';
    if (this.platform.type === 'referral') return 'Referral';
    if (this.platform.type === 'company' && this.platform.companyName)
      return this.platform.companyName;
    return 'Unknown';
  }

  get logo(): string {
    switch (this.platform.type) {
      case 'direct':
        return ''; // No logo for direct
      case 'referral':
        return 'assets/icons/referral.svg'; // Example referral icon
      case 'company':
        if (this.platform.companyName === 'OPTIEX')
          return 'assets/icons/optiex.svg';
        if (this.platform.companyName === 'DOQFY')
          return 'assets/icons/doqfy.svg';
        return '';
      default:
        return '';
    }
  }
}
