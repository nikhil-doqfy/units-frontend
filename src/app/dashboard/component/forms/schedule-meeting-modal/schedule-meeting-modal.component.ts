import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LeadsService } from '../../../services/leads.service';
import { AlertService } from '../../../../shared/services/alert.service';

@Component({
  selector: 'app-schedule-meeting-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './schedule-meeting-modal.component.html',
  styleUrl: './schedule-meeting-modal.component.css',
})
export class ScheduleMeetingModalComponent implements OnInit {
  @Input() leadId!: number;
  @Input() leadName: string = '';

  private fb = inject(FormBuilder);
  private activeModal = inject(NgbActiveModal);
  private leadsService = inject(LeadsService);
  private alertService = inject(AlertService);

  form!: FormGroup;
  isLoading = false;

  /** Today in YYYY-MM-DD for the date input min */
  today = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(1000)]],
      scheduled_date: ['', Validators.required],
      scheduled_time: ['', Validators.required],
      duration_minutes: [
        60,
        [Validators.required, Validators.min(15), Validators.max(480)],
      ],
    });
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }

  /** Build Google Calendar event URL */
  private buildGoogleCalendarUrl(
    title: string,
    description: string,
    startIso: string,
    durationMinutes: number,
  ): string {
    const start = new Date(startIso);
    const end = new Date(start.getTime() + durationMinutes * 60_000);

    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').replace('.000', '');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      details: description || '',
      dates: `${fmt(start)}/${fmt(end)}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const {
      title,
      description,
      scheduled_date,
      scheduled_time,
      duration_minutes,
    } = this.form.value;

    const scheduledIso = `${scheduled_date}T${scheduled_time}:00`;

    this.isLoading = true;

    this.leadsService
      .createActivityLog({
        lead_id: this.leadId,
        activity_type: 'MEETING',
        title,
        description,
        scheduled_date: scheduledIso,
      })
      .subscribe({
        next: (resp: any) => {
          this.isLoading = false;
          this.alertService.success(
            resp?.message || 'Meeting scheduled successfully',
          );

          // Open Google Calendar in new tab
          const gcUrl = this.buildGoogleCalendarUrl(
            title,
            description,
            scheduledIso,
            duration_minutes,
          );
          window.open(gcUrl, '_blank', 'noopener,noreferrer');

          this.activeModal.close(true);
        },
        error: (err: any) => {
          this.isLoading = false;
          this.alertService.error(
            err?.error?.message || 'Failed to schedule meeting',
          );
        },
      });
  }
}
