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
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { FilterPopupButtonComponent } from '../../component/filter-popup-btn/filter-popup-btn.component';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { FilterIconComponent } from '../../component/icons/filter-icon/filter-icon.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ThemeService } from '../../../theme.service';
import { StorageService } from '../../../shared/services/storage.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { SharedApiService } from '../../../shared/services/shared-api.service';

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
  private themeService = inject(ThemeService);
  private sharedApiService = inject(SharedApiService);
  private storageService = inject(StorageService);
  private onTicketSearch$ = new Subject<string>();
  breadcrumbData: any[] = [];
  private destroyRef = inject(DestroyRef);
  showDetailView: boolean = false;
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
  initTicketSearchListener(): void {
    this.onTicketSearch$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((searchText: string) => {
        this.searchTerm = searchText.trim();
        this.currentPage = 1;
        this.getSupportTickets();
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
  isLoadingTicketDetail = false;
  isSendingReply = false;
  searchTerm = '';
  statusFilter = 'All';

  isPropertyManager = false;

  /* ── Dummy ticket data ── */
  dummyTickets = [];

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
    return this.tickets.filter((t) => {
      const matchSearch =
        !this.searchTerm ||
        String(t.subject || t.description || '')
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        String(t.code || t.id || '')
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        String(t.property || '')
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase());

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
      this.currentPage = 1;
      this.getSupportTickets();
    }
  }

  searchTextChange(search: string): void {
    this.onTicketSearch$.next(search);
  }
  removeFilter() {
    this.selectedComplaintstatus = null;
    this.currentPage = 1;
    this.getSupportTickets();
  }
  applyFilter() {
    this.currentPage = 1;

    this.getSupportTickets();

    setTimeout(() => {
      // this.ticketFilterPopup?.closePopup();
    });
  }
  onRefresh() {
    this.getSupportTickets();
  }
  /* ── Open ticket detail ── */
  openTicket(ticketId: any): void {
    const ticketIdValue = ticketId?.id ?? ticketId?.ticket_id ?? ticketId;
    if (!ticketIdValue && ticketIdValue !== 0) {
      console.warn('Invalid ticket ID:', ticketIdValue);
      return;
    }
    this.router.navigate(['/dashboard/raise-complaint/detail'], {
      queryParams: { ticket_id: ticketIdValue },
    });
  }

  backToList(): void {
    this.ticketView = 'list';
    this.showDetailView = false;
    this.selectedTicket = null;
    this.replyText = '';
    this.router.navigate(['/dashboard/raise-complaint']);
  }

  /* ── Dummy send reply ── */
  sendReply(): void {
    const message = this.replyText.trim();
    const ticketId = this.selectedTicket?.id ?? this.selectedTicket?.ticket_id;
    if (!message || ticketId === undefined || this.isSendingReply) return;

    this.isSendingReply = true;
    this.complaintService.replyToSupportTicket(ticketId, message).subscribe({
      next: () => {
        this.replyText = '';
        this.loadTicketDetail(ticketId);
      },
      error: (err) =>
        console.error('Failed to send support ticket reply:', err),
      complete: () => (this.isSendingReply = false),
    });
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
    this.isPropertyManager = this.themeService.getRole() === 'property-manager';
    if (this.isPropertyManager) {
      this.activeTab = 'myTickets';
      this.getSupportTickets();
    }
    this.sharedService.initLanguage();
    this.loadFaqs();
    this.loadBreadcrumb();
    this.sharedService.initLanguage();
    this.initLanguageListener();
    this.initTicketSearchListener();
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const ticketId = params.get('ticket_id');
        if (ticketId) {
          this.activeTab = 'myTickets';
          this.loadTicketDetail(ticketId);
        }
      });
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

  sendTicket() {
    if (!this.description.trim()) return;
    this.complaintService.raiseComplaint(this.description).subscribe({
      next: () => {
        alert('Ticket sent successfully!');
        this.description = '';
      },
      error: () => alert('Failed to send ticket.'),
    });
  }
  getOptionTypes(options: string[]) {
    this.sharedApiService
      .getOptions({ option_type: options.join(',') })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.complaintsStatus = response?.content?.support_status;
        },
      });
  }
  onHandleComplaintsStatusClick(): void {
    this.getOptionTypes(['SUPPORT_STATUS']);
  }
  getSupportTickets(): void {
    const params: Record<string, any> = {};

    if (this.searchTerm?.trim()) {
      params['search'] = this.searchTerm.trim();
    }

    if (this.selectedComplaintstatus) {
      params['support_status'] =
        typeof this.selectedComplaintstatus === 'string'
          ? this.selectedComplaintstatus
          : this.selectedComplaintstatus.id;
    }

    console.log('Support Ticket Params:', params);

    this.complaintService
      .getSupportTickets(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          console.log('Support Ticket Response:', res);

          this.tickets = (res?.content || []).map((ticket: any) => ({
            ...ticket,
            tenantName: ticket?.tenant?.name ?? '--',
          }));

          this.totalRecords = this.tickets.length;
        },
        error: (err) => {
          console.error('Failed to fetch support tickets:', err);
          this.tickets = [];
          this.totalRecords = 0;
        },
      });
  }

  private loadTicketDetail(ticketId: number | string): void {
    this.isLoadingTicketDetail = true;
    this.complaintService
      .getSupportTicketDetail(ticketId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          const ticket =
            res?.content?.ticket ?? res?.content ?? res?.data ?? res;
          this.selectedTicket = this.normalizeTicket(ticket, ticketId);
          this.ticketView = 'detail';
          this.showDetailView = true;
          this.isLoadingTicketDetail = false;
        },
        error: (err) => {
          console.error('Failed to fetch support ticket detail:', err);
          this.isLoadingTicketDetail = false;
        },
      });
  }

  private normalizeTicket(ticket: any, ticketId: number | string): any {
    const messages =
      ticket?.messages ?? ticket?.replies ?? ticket?.conversation ?? [];
    return {
      ...ticket,
      id: ticket?.id ?? ticket?.ticket_id ?? ticketId,
      code: ticket?.code ?? ticket?.ticket_code ?? `#${ticketId}`,
      subject: ticket?.subject ?? ticket?.title ?? ticket?.description ?? '--',
      property: ticket?.property?.name ?? ticket?.property ?? '--',
      created: ticket?.created ?? ticket?.created_at ?? '--',
      statusKey:
        ticket?.status?.key ?? ticket?.status_key ?? ticket?.status ?? 'OPEN',
      statusLabel:
        ticket?.status?.value ??
        ticket?.status_label ??
        ticket?.status ??
        'Open',
      messages: messages.map((message: any) => ({
        ...message,
        sender: this.getMessageSenderName(message, ticket),
        role: this.getMessageSenderRole(message, ticket),
        time:
          message?.formatted_time ??
          message?.created_at ??
          message?.created ??
          '',
        text: message?.description ?? message?.message ?? message?.text ?? '',
        avatar:
          message?.sender?.profile_image ??
          message?.profile_image ??
          'assets/userDefaultProImg.png',
      })),
    };
  }

  private getMessageSenderName(message: any, ticket: any): string {
    const author =
      message?.sender ??
      message?.user ??
      message?.created_by ??
      message?.replied_by ??
      message?.tenant ??
      message?.property_manager;
    const name = this.getPersonName(author);

    return (
      name ||
      message?.sender_name ||
      message?.user_name ||
      message?.created_by_name ||
      message?.name ||
      this.getCurrentUserNameIfAuthor(message) ||
      this.getTicketParticipantName(
        ticket,
        this.getMessageSenderRole(message, ticket),
      ) ||
      (this.getMessageSenderRole(message, ticket) === 'TENANT'
        ? 'Tenant'
        : 'Property Manager')
    );
  }

  private getMessageSenderRole(message: any, ticket: any): 'TENANT' | 'PM' {
    const rawRole =
      message?.role ??
      message?.sender_role ??
      message?.sender?.role ??
      message?.user?.role ??
      message?.created_by?.role ??
      message?.replied_by?.role ??
      message?.tenant?.role ??
      message?.property_manager?.role;
    const role = String(rawRole?.key ?? rawRole?.name ?? rawRole ?? '')
      .toLowerCase()
      .replace(/[_\s-]/g, '');

    if (role.includes('tenant')) return 'TENANT';
    if (role.includes('propertymanager') || role === 'pm') return 'PM';

    const profile = this.storageService.getUserProfile();
    const authorId =
      message?.sender_id ??
      message?.user_id ??
      message?.created_by_id ??
      message?.replied_by_id ??
      message?.sender?.id ??
      message?.user?.id ??
      message?.created_by?.id ??
      message?.replied_by?.id;
    const currentUserId = profile?.id ?? profile?.user_id;

    if (
      authorId !== undefined &&
      currentUserId !== undefined &&
      String(authorId) === String(currentUserId)
    ) {
      return this.themeService.getRole() === 'tenant' ? 'TENANT' : 'PM';
    }

    const authorName =
      this.getPersonName(
        message?.sender ?? message?.user ?? message?.created_by,
      ) ||
      message?.sender_name ||
      message?.user_name ||
      message?.name;
    if (
      authorName &&
      authorName.toLowerCase() === this.getPersonName(profile).toLowerCase()
    ) {
      return this.themeService.getRole() === 'tenant' ? 'TENANT' : 'PM';
    }

    return this.themeService.getRole() === 'property-manager' ? 'TENANT' : 'PM';
  }

  private getPersonName(person: any): string {
    if (!person) return '';
    if (typeof person === 'string') return person;

    return (
      person?.name ||
      person?.full_name ||
      [person?.first_name, person?.last_name].filter(Boolean).join(' ') ||
      ''
    );
  }

  private getCurrentUserNameIfAuthor(message: any): string {
    const profile = this.storageService.getUserProfile();
    const currentUserId = profile?.id ?? profile?.user_id;
    const authorId =
      message?.sender_id ?? message?.user_id ?? message?.created_by_id;

    if (
      authorId === undefined ||
      currentUserId === undefined ||
      String(authorId) !== String(currentUserId)
    ) {
      return '';
    }

    return this.getPersonName(profile);
  }

  private getTicketParticipantName(ticket: any, role: 'TENANT' | 'PM'): string {
    const person =
      role === 'TENANT'
        ? (ticket?.tenant ??
          ticket?.raised_by ??
          ticket?.created_by ??
          ticket?.user ??
          ticket?.requester)
        : (ticket?.property_manager ??
          ticket?.propertyManager ??
          ticket?.pmc ??
          ticket?.manager ??
          ticket?.property?.property_manager ??
          ticket?.property?.pmc);

    return (
      this.getPersonName(person) ||
      (role === 'TENANT'
        ? (ticket?.tenant_name ?? ticket?.raised_by_name)
        : (ticket?.property_manager_name ??
          ticket?.propertyManagerName ??
          ticket?.pmc_name)) ||
      ''
    );
  }
}
