import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CallIconsNewComponent } from '../../../icons/call-icons-new/call-icons-new.component';
import { DoubleCopyIconComponent } from '../../../icons/double-copy-icon/double-copy-icon.component';

export type PlatformType = 'direct' | 'referral' | 'company';
export type CompanyName = 'OPTIEX' | 'DOQFY';
@Component({
  selector: 'app-platfrom-badge',
  standalone: true,
  imports: [CommonModule, CallIconsNewComponent, DoubleCopyIconComponent],
  templateUrl: './platfrom-badge.component.html',
  styleUrl: './platfrom-badge.component.css',
})
export class PlatfromBadgeComponent {
  @Input() logo?: string;

  @Input() platform!: {
    type: 'propertyFinder' | 'bayut' | 'direct' | 'referral';
  };

  get label(): string {
    switch (this.platform.type) {
      case 'propertyFinder': return 'Property Finder';
      case 'bayut': return 'Bayut';
      case 'direct': return 'Direct';
      case 'referral': return 'Referral';
      default: return '';
    }
  }

  get logoSrc(): string | null {
    switch (this.platform.type) {
      case 'propertyFinder': return 'assets/platfrom/property-finder.svg';
      case 'bayut': return 'assets/platfrom/buyut.svg';
      default: return null;
    }
  }
}
