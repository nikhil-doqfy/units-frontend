import { Component, OnInit, inject, DestroyRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgOtpInputModule } from 'ng-otp-input';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-lease-approval',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgOtpInputModule],
  templateUrl: './lease-approval.component.html',
  styleUrls: ['./lease-approval.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class LeaseApprovalComponent implements OnInit {
  private route   = inject(ActivatedRoute);
  private http    = inject(HttpClient);
  private alert      = inject(AlertService);
  private destroy    = inject(DestroyRef);
  private sanitizer  = inject(DomSanitizer);
  private BASE       = environment.SERVER_ADDRESS;

  // Query param values
  leaseId  = '';
  role     = '';
  email    = '';

  // Steps: 'otp' | 'approve' | 'success'
  step: 'otp' | 'approve' | 'success' = 'otp';

  otp = '';
  otpSending     = false;   // spinner only while sending OTP
  otpSent        = false;   // true once OTP has been sent at least once
  otpLoading     = false;   // spinner while verifying OTP
  approveLoading = false;
  consentChecked = false;

  // Lease details returned after OTP verify
  pdfUrl: SafeResourceUrl = '';
  rawPdfUrl = '';
  leaseCode    = '';
  tenantName   = '';
  propertyName = '';
  unitName     = '';

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroy)).subscribe(p => {
      this.leaseId = p['lease'] ?? '';
      this.role    = p['role']  ?? '';
      this.email   = p['email'] ?? '';
    });
  }

  sendOtp(): void {
    this.otpSending = true;
    this.http.post(`${this.BASE}/api/lease/approval-otp`, {
      lease_id: +this.leaseId,
      role:     this.role,
      email:    this.email.trim().toLowerCase(),
    }).pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          this.otpSending = false;
          this.otpSent    = true;
          this.alert.success('OTP sent to ' + this.email);
        },
        error: () => {
          this.otpSending = false;
        },
      });
  }

  onOtpChange(val: string): void {
    this.otp = val;
  }

  verifyOtp(): void {
    if (this.otp.length < 6) {
      this.alert.error('Please enter the 6-digit OTP');
      return;
    }
    this.otpLoading = true;
    this.http.post(`${this.BASE}/api/lease/approval-otp-verify`, {
      lease_id: +this.leaseId,
      role:     this.role,
      email:    this.email.trim().toLowerCase(),
      otp:      this.otp,
    }).pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (resp: any) => {
          this.otpLoading = false;
          const c = resp?.content ?? {};
          this.rawPdfUrl    = c.pdf_url ?? '';
          this.pdfUrl       = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawPdfUrl);
          this.leaseCode    = c.lease_code    ?? '';
          this.tenantName   = c.tenant_name   ?? '';
          this.propertyName = c.property_name ?? '';
          this.unitName     = c.unit_name     ?? '';
          this.step = 'approve';
        },
        error: (err: any) => {
          this.otpLoading = false;
          const msg = err?.error?.message || 'OTP verification failed. Please try again.';
          this.alert.error(msg);
        },
      });
  }

  approveLease(): void {
    if (!this.consentChecked) {
      this.alert.error('Please check the consent checkbox before approving.');
      return;
    }
    this.approveLoading = true;
    this.http.post(`${this.BASE}/api/lease/approve`, {
      lease_id: +this.leaseId,
      role:     this.role,
      email:    this.email,
    }).pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          this.approveLoading = false;
          this.step = 'success';
        },
        error: () => { this.approveLoading = false; },
      });
  }

  get roleLabel(): string {
    return this.role === 'owner' ? 'Owner' : 'Tenant';
  }
}
