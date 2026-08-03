import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../shared.service';
import { PrivacyPolicyService } from '../../../privacy-policy.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, WhiteCardComponent, TranslateModule],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css'],
})
export class PrivacyPolicyComponent {
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  private privacyPolicyService = inject(PrivacyPolicyService);
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/properties' },
    { label: 'Privacy Policy', link: '' },
  ];
  currentLanguage = 'en';
  privacyPolicies: any[] = [];
  constructor(private router: Router) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
  }
  ngOnInit() {
    this.sharedService.initLanguage();
    this.getPrivacyPolicy();
  }
  getPrivacyPolicy(): void {
    this.privacyPolicyService.getPrivacyPolicy().subscribe({
      next: (resp: any) => {
        this.privacyPolicies = resp?.content?.results ?? [];
      },
    });
  }
}
