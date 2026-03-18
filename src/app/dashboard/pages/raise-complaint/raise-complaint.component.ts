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
