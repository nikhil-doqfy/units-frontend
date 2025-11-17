import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { RaiseComplaintCardComponent } from '../../component/raise-complaint-card/raise-complaint-card.component';
import { SendIconComponent } from '../../component/icons/send-icon/send-icon.component';
import { FAQAccordianCardComponent } from '../../component/faq-accordian-card/faq-accordian-card.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-raise-complaint',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RaiseComplaintCardComponent,
    SendIconComponent,
    FAQAccordianCardComponent,
    TranslateModule,
  ],
  templateUrl: './raise-complaint.component.html',
  styleUrls: ['./raise-complaint.component.css'],
})
export class RaiseComplaintComponent {
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/properties' },
    { label: 'Raise Complaint', link: '' },
  ];
  constructor(private router: Router) {}
  faqList = [
    {
      title: 'How do I add a new property to my account?',
      content:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
    },
    {
      title: 'Can I manage multiple properties from one account?',
      content:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
    },
    {
      title: 'How do tenants pay rent through the platform?',
      content:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
    },
    {
      title: 'Can I track maintenance requests and service updates?',
      content:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
    },
    {
      title: '{{"Is my property and tenant data secure?"|tra}}',
      content:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
    },
  ];
}
