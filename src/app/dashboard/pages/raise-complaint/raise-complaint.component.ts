import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { RaiseComplaintCardComponent } from '../../component/raise-complaint-card/raise-complaint-card.component';
import { SendIconComponent } from '../../component/icons/send-icon/send-icon.component';
import { FAQAccordianCardComponent } from '../../component/faq-accordian-card/faq-accordian-card.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../shared.service';
import { RaiseComplaintService } from '../../raise-complaint.service';
import { PreviewIconComponent } from '../../component/icons/preview-icon/preview-icon.component';
import { TablePaginationComponent } from '../../component/table-pagination/table-pagination.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../shared/model/shared.model';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { TableSearchComponent } from '../../component/table-search/table-search.component';
import { CustomSelectComponent } from '../../../auth/component/custom-select/custom-select.component';
import { FilterPopupButtonComponent } from '../../component/filter-popup-btn/filter-popup-btn.component';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type TabView = 'raise' | 'myTickets';
type TicketView = 'list' | 'detail';

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
    PreviewIconComponent,
    TablePaginationComponent,
    TableSelectComponent,
    TableTitleComponent,
    TableSearchComponent,
    CustomSelectComponent,
    FilterPopupButtonComponent,
    TableFilterButtonComponent,
    FilterIconComponent,
  ],
  templateUrl: './raise-complaint.component.html',
  styleUrls: ['./raise-complaint.component.css'],
})
export class RaiseComplaintComponent {
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  private complaintService = inject(RaiseComplaintService);
  breadcrumbData: any[] = [];
  private destroyRef = inject(DestroyRef);

  complaintsStatus: any = [];
  selectedComplaintstatus: any = null;
  constructor(private router: Router) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
  }

  loadBreadcrumb() {
    this.setBreadCrumb([
      { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
      { label: 'PAGE_TITLE.SUPPORT', link: '' },
    ]);
  }
  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }
  initLanguageListener() {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadBreadcrumb();
      });
  }
  // ── Table state ──────────────────────────────────
  tenants: any[] = [];
  totalRecords = 0;
  rowsPerPage = 10;
  currentPage = 1;
  totalPages = 1;
  rowsPerPageOptions = [10, 25, 50, 100];
  componentName = 'TenantsComponent';
  tickets: any[] = [];

  /* ── Existing ── */
  description = '';
  faqList: any[] = [];

  /* ── Tab / view state ── */
  activeTab: TabView = 'raise';
  ticketView: TicketView = 'list';
  selectedTicket: any = null;
  replyText = '';
  searchTerm = '';
  statusFilter = 'All';

  /* ── Dummy ticket data ── */
  dummyTickets = [
    {
      code: 'SUP-00025',
      subject: 'Issue with Invoice download',
      property: 'Marina Heights – A101',
      created: '11 Aug 2025, 11:30 AM',
      statusKey: 'OPEN',
      statusLabel: 'Open',
      ago: '2 days ago',
      messages: [
        {
          id: 1,
          sender: 'You',
          role: 'TENANT',
          time: '11:20 AM',
          text: 'I am not able to download the Invoice for July.',
          avatar: 'assets/userDefaultProImg.png',
        },
        {
          id: 2,
          sender: 'Property Manager',
          role: 'PM',
          time: '11:45 AM',
          text: 'We are checking this issue and will get back to you soon.',
          avatar: 'assets/userDefaultProImg.png',
        },
      ],
    },
    {
      code: 'SUP-00024',
      subject: 'Request for Ejari Certificate',
      property: 'Marina Heights – A101',
      created: '09 Aug 2025, 10:00 AM',
      statusKey: 'IN_PROGRESS',
      statusLabel: 'In Progress',
      ago: '14 days ago',
      messages: [
        {
          id: 1,
          sender: 'You',
          role: 'TENANT',
          time: '10:00 AM',
          text: 'Please share the Ejari Certificate for our unit.',
          avatar: 'assets/userDefaultProImg.png',
        },
        {
          id: 2,
          sender: 'Property Manager',
          role: 'PM',
          time: '10:30 AM',
          text: 'We have initiated the request. It will be ready within 3 working days.',
          avatar: 'assets/userDefaultProImg.png',
        },
        {
          id: 3,
          sender: 'You',
          role: 'TENANT',
          time: '10:35 AM',
          text: 'Thank you, please let me know once it is ready.',
          avatar: 'assets/userDefaultProImg.png',
        },
      ],
    },
    {
      code: 'SUP-00023',
      subject: 'Maintenance request',
      property: 'Marina Heights – A101',
      created: '01 Aug 2025, 09:15 AM',
      statusKey: 'CLOSED',
      statusLabel: 'Closed',
      ago: '20 days ago',
      messages: [
        {
          id: 1,
          sender: 'You',
          role: 'TENANT',
          time: '09:15 AM',
          text: 'The AC in the bedroom is not working. Please send someone to check.',
          avatar: 'assets/userDefaultProImg.png',
        },
        {
          id: 2,
          sender: 'Property Manager',
          role: 'PM',
          time: '10:00 AM',
          text: 'We are checking this issue and will get back to you soon.',
          avatar: 'assets/userDefaultProImg.png',
        },
        {
          id: 3,
          sender: 'Property Manager',
          role: 'PM',
          time: '11:30 AM',
          text: 'The issue has been fixed. Please try again and let us know.',
          avatar: 'assets/userDefaultProImg.png',
        },
      ],
    },
  ];

  onPageChange(event: PageChange) {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
  }
  onPageSizeChange(event: PageSizeChange) {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
  }
  get filteredTickets(): any[] {
    return this.dummyTickets.filter((t) => {
      const matchSearch =
        !this.searchTerm ||
        t.subject.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        t.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        t.property.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchStatus =
        this.statusFilter === 'All' || t.statusKey === this.statusFilter;

      return matchSearch && matchStatus;
    });
  }

  /* ── Tab switch ── */
  switchTab(tab: TabView): void {
    this.activeTab = tab;
    if (tab === 'myTickets') {
      this.ticketView = 'list';
      this.selectedTicket = null;
    }
  }

  removeFilter() {
    // this.selectedComplaintstatus = null;
    this.currentPage = 1;
    // this.getTickets();
  }
  applyFilter() {
    this.currentPage = 1;

    // this.getTickets();

    setTimeout(() => {
      // this.ticketFilterPopup?.closePopup();
    });
  }
  onRefresh() {}
  /* ── Open ticket detail ── */
  openTicket(ticket: any): void {
    this.selectedTicket = {
      ...ticket,
      messages: ticket.messages.map((m: any) => ({ ...m })),
    };
    this.replyText = '';
    this.ticketView = 'detail';
  }

  backToList(): void {
    this.ticketView = 'list';
    this.selectedTicket = null;
    this.replyText = '';
  }

  /* ── Dummy send reply ── */
  sendReply(): void {
    if (!this.replyText.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'You',
      role: 'TENANT',
      time: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      text: this.replyText.trim(),
      avatar: 'assets/userDefaultProImg.png',
    };
    this.selectedTicket.messages.push(newMsg);
    this.replyText = '';

    /* Simulate PM reply after 1.5 s */
    setTimeout(() => {
      this.selectedTicket.messages.push({
        id: Date.now() + 1,
        sender: 'Property Manager',
        role: 'PM',
        time: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        text: 'Thank you for your message. We will look into this and get back to you shortly.',
        avatar: 'assets/userDefaultProImg.png',
      });
    }, 1500);
  }

  /* ── Status badge css class ── */
  badgeClass(key: string): string {
    switch (key) {
      case 'OPEN':
        return 'stBadgeOpen';
      case 'IN_PROGRESS':
        return 'stBadgeInProgress';
      case 'RESOLVED':
        return 'stBadgeResolved';
      case 'CLOSED':
        return 'stBadgeClosed';
      default:
        return 'stBadgeOpen';
    }
  }

  /* ── Existing ── */
  ngOnInit() {
    this.sharedService.initLanguage();
    this.loadFaqs();
    this.loadBreadcrumb();
    this.sharedService.initLanguage();
    this.initLanguageListener();
    this.getSupportTickets();
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
    if (!this.description.trim()) return;
    this.complaintService.raiseComplaint(this.description).subscribe({
      next: () => {
        alert('Complaint sent successfully!');
        this.description = '';
      },
      error: () => alert('Failed to send complaint.'),
    });
  }
  getSupportTickets(): void {
    this.complaintService
      .getSupportTickets()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          console.log('Support Ticket Response:', res);

          this.tickets = res?.content || [];
          this.totalRecords = this.tickets.length;
        },
        error: (err) => {
          console.error('Failed to fetch support tickets:', err);
          this.tickets = [];
          this.totalRecords = 0;
        },
      });
  }
}
