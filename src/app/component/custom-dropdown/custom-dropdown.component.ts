import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject,
} from '@angular/core';
import { ArrowDownIconComponent } from '../../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArrowUpIconComponent } from '../../shared/component/icons/arrow-up-icon/arrow-up-icon.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { LeaseService } from '../../dashboard/services/lease.service';
import { AlertService } from '../../shared/services/alert.service';

type ReceiptType = 'RENTAL' | 'OTHER_CHARGES' | 'COMBINED';

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [
    ArrowDownIconComponent,
    CommonModule,
    FormsModule,
    ArrowUpIconComponent,
    NgbDropdownModule,
  ],
  templateUrl: './custom-dropdown.component.html',
  styleUrl: './custom-dropdown.component.css',
})
export class CustomDropdownComponent {
  @Output() detailViewChanges = new EventEmitter<boolean>();

  private leaseService = inject(LeaseService);
  private alertService = inject(AlertService);

  isOpen = false;
  @Input() title: string = '';
  @Input() hasIcon: boolean = true;
  /** Lease this receipt dropdown generates PDFs for -- when not provided
   * (e.g. a page listing many leases with no single one selected), the
   * dropdown still opens but Generate is a no-op. */
  @Input() leaseId: number | null = null;

  showReceiptDropdown = false;
  showMonthDropdown = false;

  selectedReceiptType = '';

  availableMonths: { key: string; label: string }[] = [];
  selectedMonths = new Set<string>();
  loadingMonths = false;
  generating = false;

  constructor(private eRef: ElementRef) {}

  selectReceiptType(type: string) {
    this.selectedReceiptType = type;
    if (type === 'rental') {
      this.showReceiptDropdown = false;
      this.showMonthDropdown = true;
      this.loadMonths();
      this.detailViewChanges.emit(false);
      return;
    }
    // Other Charges / Combined always include everything -- no month
    // picker needed, generate straight away.
    this.showReceiptDropdown = false;
    this.generateReceipt(type === 'charges' ? 'OTHER_CHARGES' : 'COMBINED');
  }

  private loadMonths() {
    if (!this.leaseId) return;
    this.loadingMonths = true;
    this.availableMonths = [];
    this.selectedMonths.clear();
    this.leaseService.getRentReceiptMonths(this.leaseId).subscribe({
      next: (resp: any) => {
        this.loadingMonths = false;
        this.availableMonths = resp?.content ?? [];
        // Default to all months selected -- convenient for the common
        // case of "give me every rent receipt so far".
        this.availableMonths.forEach((m) => this.selectedMonths.add(m.key));
      },
      error: () => {
        this.loadingMonths = false;
        this.alertService.error('Failed to load available months.');
      },
    });
  }

  toggleMonth(key: string) {
    if (this.selectedMonths.has(key)) {
      this.selectedMonths.delete(key);
    } else {
      this.selectedMonths.add(key);
    }
  }

  isMonthSelected(key: string): boolean {
    return this.selectedMonths.has(key);
  }

  generateReceipt(type: ReceiptType) {
    if (!this.leaseId) {
      this.alertService.error('No lease selected.');
      return;
    }
    if (type === 'RENTAL' && this.selectedMonths.size === 0) {
      this.alertService.error('Select at least one month.');
      return;
    }
    if (this.generating) return;
    this.generating = true;

    const months = type === 'RENTAL' ? Array.from(this.selectedMonths) : undefined;
    this.leaseService.getChequeReceiptPdf(this.leaseId, type, months).subscribe({
      next: (resp: any) => {
        this.generating = false;
        const pdfUrl = resp?.content?.pdf_url;
        if (!pdfUrl) {
          this.alertService.error('Failed to generate receipt');
          return;
        }
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = resp?.content?.file_name || 'receipt.pdf';
        link.target = '_blank';
        link.click();
        this.closeDropdown();
      },
      error: (err: any) => {
        this.generating = false;
        this.alertService.error(err?.error?.message || 'Failed to generate receipt');
      },
    });
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.showReceiptDropdown = true;
      this.showMonthDropdown = false;
    } else {
      this.showReceiptDropdown = false;
      this.showMonthDropdown = false;
    }

    this.showReceiptDropdown = true;
  }
  onDropdownOpenChange(open: boolean) {
    this.isOpen = open;
    if (!open) {
      this.showReceiptDropdown = false;
      this.showMonthDropdown = false;
    }
  }

  closeDropdown() {
    this.isOpen = false;
    this.showReceiptDropdown = false;
    this.showMonthDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }
}
