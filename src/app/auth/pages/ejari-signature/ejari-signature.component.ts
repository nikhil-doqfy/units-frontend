import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../../environments/environment';

type SignStep = 'sign' | 'redirecting' | 'success' | 'failed';

@Component({
  selector: 'app-ejari-signature',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ejari-signature.component.html',
  styleUrls: ['./ejari-signature.component.css'],
})
export class EjariSignatureComponent {
  private route   = inject(ActivatedRoute);
  private http    = inject(HttpClient);
  private destroy = inject(DestroyRef);
  private BASE    = environment.SERVER_ADDRESS;

  leaseId = '';
  email   = '';
  role    = '';
  step: SignStep = 'sign';
  failReason = '';

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroy)).subscribe((p) => {
      this.leaseId = p['lease_id'] ?? '';
      this.email   = p['email'] ?? '';
      this.role    = p['role'] ?? '';

      const result = p['uaepass'];
      if (result === 'success') {
        this.step = 'success';
      } else if (result === 'failed') {
        this.step = 'failed';
        this.failReason = p['reason'] ?? '';
      }
    });
  }

  signWithUaePass(): void {
    if (!this.leaseId || !this.email || !this.role) return;
    this.step = 'redirecting';

    this.http
      .get(`${this.BASE}/api/lease/esign/start`, {
        params: { lease_id: this.leaseId, email: this.email, role: this.role },
      })
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (resp: any) => {
          const url = resp?.content?.authorize_url;
          if (url) {
            window.location.href = url;
          } else {
            this.step = 'failed';
            this.failReason = 'no_authorize_url';
          }
        },
        error: (err: any) => {
          this.step = 'failed';
          this.failReason = err?.error?.message || 'request_failed';
        },
      });
  }

  retry(): void {
    this.step = 'sign';
    this.failReason = '';
  }
}
