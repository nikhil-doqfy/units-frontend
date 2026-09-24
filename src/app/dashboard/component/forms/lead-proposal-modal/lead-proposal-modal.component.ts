import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LeadsService } from '../../../services/leads.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { BadgeComponent } from '../../badge/badge.component';
import { ChargesService } from '../../../../charges.service';

const REOPENABLE_STATUSES = ['CLOSED', 'HOLD_EXPIRED'];

@Component({
  selector: 'app-lead-proposal-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BadgeComponent],
  templateUrl: './lead-proposal-modal.component.html',
  styleUrl: './lead-proposal-modal.component.css',
})
export class LeadProposalModalComponent implements OnInit {
  @Input() lead: any;

  activeModal = inject(NgbActiveModal);
  private fb = inject(FormBuilder);
  private leadsService = inject(LeadsService);
  private alertService = inject(AlertService);
  private chargesService = inject(ChargesService);

  isLoading = false;
  isSubmitting = false;
  didChange = false;

  proposals: any[] = [];
  latestProposal: any = null;

  sendForm!: FormGroup;
  respondForm!: FormGroup;
  confirmForm!: FormGroup;

  today = new Date().toISOString().split('T')[0];

  // Selectable charges from the Charges section (see commercialdetails
  // component for the same checkbox-list convention) -- unchecked by
  // default since not every charge applies to every proposal.
  charges: any[] = [];

  ngOnInit(): void {
    this.buildForms();
    this.loadHistory();
    this.loadCharges();
  }

  private buildForms(): void {
    this.sendForm = this.fb.group({
      offered_rent: [this.lead?.rent || null, Validators.required],
      offered_maintenance_charges: [null],
      channel: ['EMAIL', Validators.required],
    });

    this.respondForm = this.fb.group({
      response: ['HOLD', Validators.required],
      holding_amount: [null],
      hold_period_days: [null],
    });

    this.confirmForm = this.fb.group({
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      payment_frequency: ['MONTHLY', Validators.required],
    });
  }

  private loadCharges(): void {
    this.chargesService.charges().subscribe({
      next: (resp: any) => {
        this.charges = (resp?.content ?? []).map((c: any) => ({
          charge_id: c.id,
          label: c.description,
          amount: c.amount,
          tax: c.tax_code ? `VAT @${c.tax_code}%` : 'VAT @Nil',
          vat: c.vat_amount,
          total: c.total_amount,
          checked: false,
        }));
      },
      error: () => {
        this.charges = [];
      },
    });
  }

  get selectedChargesTotal(): number {
    return this.charges
      .filter((c) => c.checked)
      .reduce((sum, c) => sum + (c.total || 0), 0);
  }

  loadHistory(): void {
    if (!this.lead?.id) return;
    this.isLoading = true;
    this.leadsService.getLeadById(this.lead.id).subscribe({
      next: (resp: any) => {
        this.isLoading = false;
        this.proposals = resp?.proposals || [];
        this.latestProposal = this.proposals[0] || null;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  get showSendForm(): boolean {
    return (
      !this.latestProposal ||
      REOPENABLE_STATUSES.includes(this.latestProposal.status)
    );
  }

  get showRespondForm(): boolean {
    return this.latestProposal?.status === 'PROPOSAL_SENT';
  }

  get showHoldActions(): boolean {
    return this.latestProposal?.status === 'ON_HOLD';
  }

  get isConverted(): boolean {
    return this.latestProposal?.status === 'CONVERTED';
  }

  getStatusBadge(status: string): { title: string; color: string } {
    const map: Record<string, any> = {
      PROPOSAL_SENT: { title: 'Proposal Sent', color: 'blue' },
      ON_HOLD: { title: 'On Hold', color: 'orange' },
      CONVERTED: { title: 'Converted', color: 'green' },
      CLOSED: { title: 'Closed', color: 'red' },
      HOLD_EXPIRED: { title: 'Hold Expired', color: 'red' },
    };
    return map[status] || { title: status || '--', color: 'grey' };
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }

  close(): void {
    this.activeModal.close(this.didChange);
  }

  submitSend(): void {
    if (this.sendForm.invalid) {
      this.sendForm.markAllAsTouched();
      return;
    }
    const { offered_rent, offered_maintenance_charges, channel } = this.sendForm.value;
    const other_charges = this.charges
      .filter((c) => c.checked)
      .map((c) => ({ description: c.label, amount: c.amount }));
    this.isSubmitting = true;
    this.leadsService
      .sendProposal(this.lead.id, {
        offered_rent,
        offered_maintenance_charges,
        channel,
        other_charges,
      })
      .subscribe({
        next: (resp: any) => {
          this.isSubmitting = false;
          this.didChange = true;
          this.alertService.success(resp?.message || 'Proposal sent successfully');
          this.buildForms();
          this.loadCharges();
          this.loadHistory();
        },
        error: (err: any) => {
          this.isSubmitting = false;
          this.alertService.error(err?.error?.message || 'Failed to send proposal');
        },
      });
  }

  submitRespond(): void {
    if (this.respondForm.invalid || !this.latestProposal) {
      this.respondForm.markAllAsTouched();
      return;
    }
    const { response, holding_amount, hold_period_days } = this.respondForm.value;
    if (response === 'HOLD' && (holding_amount == null || hold_period_days == null)) {
      this.alertService.error(
        'Holding amount and hold period are required to place a hold',
      );
      return;
    }
    this.isSubmitting = true;
    this.leadsService
      .respondToProposal(this.latestProposal.id, {
        response,
        holding_amount,
        hold_period_days,
      })
      .subscribe({
        next: (resp: any) => {
          this.isSubmitting = false;
          this.didChange = true;
          this.alertService.success(resp?.message || 'Response recorded');
          this.buildForms();
          this.loadHistory();
        },
        error: (err: any) => {
          this.isSubmitting = false;
          this.alertService.error(err?.error?.message || 'Failed to record response');
        },
      });
  }

  submitConfirm(): void {
    if (this.confirmForm.invalid || !this.latestProposal) {
      this.confirmForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.leadsService
      .confirmHoldAndProceed(this.latestProposal.id, this.confirmForm.value)
      .subscribe({
        next: (resp: any) => {
          this.isSubmitting = false;
          this.didChange = true;
          this.alertService.success(resp?.message || 'Lease created successfully');
          this.buildForms();
          this.loadHistory();
        },
        error: (err: any) => {
          this.isSubmitting = false;
          this.alertService.error(err?.error?.message || 'Failed to confirm hold');
        },
      });
  }

  releaseHold(): void {
    if (!this.latestProposal) return;
    this.isSubmitting = true;
    this.leadsService.releaseExpiredHold(this.latestProposal.id).subscribe({
      next: (resp: any) => {
        this.isSubmitting = false;
        this.didChange = true;
        this.alertService.success(resp?.message || 'Hold released');
        this.buildForms();
        this.loadHistory();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.alertService.error(err?.error?.message || 'Failed to release hold');
      },
    });
  }
}
