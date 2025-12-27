import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { RaiseComplaintCardComponent } from '../../component/raise-complaint-card/raise-complaint-card.component';
import { SendIconComponent } from '../../component/icons/send-icon/send-icon.component';
import { FAQAccordianCardComponent } from '../../component/faq-accordian-card/faq-accordian-card.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../shared.service';
import { RaiseComplaintService } from '../../raise-complaint.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-raise-complaint',
  standalone: true,
  imports: [
    FormsModule,
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
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  private complaintService = inject(RaiseComplaintService);
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/properties' },
    { label: 'Raise Complaint', link: '' },
  ];
  message = '';
  faqList: any[] = [];
  currentLanguage = 'en';
  constructor(private router: Router) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
  }

  ngOnInit() {
    this.sharedService.initLanguage();
    this.loadFaqs();
  }
  // faqList = [
  //   {
  //     title: 'How do I add a new property to my account?',
  //     content:
  //       'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
  //   },
  //   {
  //     title: 'Can I manage multiple properties from one account?',
  //     content:
  //       'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
  //   },
  //   {
  //     title: 'How do tenants pay rent through the platform?',
  //     content:
  //       'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
  //   },
  //   {
  //     title: 'Can I track maintenance requests and service updates?',
  //     content:
  //       'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
  //   },
  //   {
  //     title: '{{"Is my property and tenant data secure?"|tra}}',
  //     content:
  //       'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
  //   },
  // ];

  loadFaqs() {
    this.complaintService.getFaqList().subscribe({
      next: (res: any) => {
        this.faqList = res.content.map((faq: any) => ({
          title: faq.question,
          content: faq.answer,
        }));
      },
      error: (err) => console.error('Failed to fetch FAQs', err),
    });
  }
  sendComplaint() {
    if (!this.message.trim()) return;

    this.complaintService.raiseComplaint(this.message).subscribe({
      next: () => {
        alert('Complaint sent successfully!');
        this.message = '';
      },
      error: () => alert('Failed to send complaint.'),
    });
  }
}
