import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedService } from '../../../shared.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, WhiteCardComponent, TranslateModule],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css'],
})
export class PrivacyPolicyComponent {
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/properties' },
    { label: 'Privacy Policy', link: '' },
  ];
  constructor(private router: Router) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
  }
}
