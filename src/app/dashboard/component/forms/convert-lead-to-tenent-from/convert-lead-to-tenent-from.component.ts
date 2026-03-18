import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatfromBadgeComponent } from '../../platfrom-badge/platfrom-badge.component';

@Component({
  selector: 'app-convert-lead-to-tenent-from',
  standalone: true,
  imports: [CommonModule, PlatfromBadgeComponent],
  templateUrl: './convert-lead-to-tenent-from.component.html',
  styleUrl: './convert-lead-to-tenent-from.component.css',
})
export class ConvertLeadToTenentFromComponent {
  @Input() leadData: any = null;

  getPlatformType(platform: string): 'propertyFinder' | 'bayut' | 'direct' | 'referral' {
    const map: Record<string, any> = {
      PROPERTY_FINDER: 'propertyFinder',
      BAYUT: 'bayut',
      DIRECT: 'direct',
      REFERRAL: 'referral',
    };
    return map[platform] || 'direct';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      INTERESTED: 'Interested',
      NOT_INTERESTED: 'Not Interested',
      LEASE_TENANCY: 'Lease/Tenancy',
    };
    return map[status] || status;
  }
}
