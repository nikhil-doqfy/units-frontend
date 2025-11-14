import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WhiteCardComponent } from "../../../shared/component/white-card/white-card.component";

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, WhiteCardComponent],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css']
})
export class PrivacyPolicyComponent {
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/properties' },
    { label: 'Privacy Policy', link: '' },
  ];
  constructor(private router: Router) { }
}

