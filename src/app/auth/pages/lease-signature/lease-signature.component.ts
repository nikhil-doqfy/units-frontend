import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  DestroyRef,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgOtpInputModule } from 'ng-otp-input';
import { environment } from '../../../../environments/environment';
import { AlertService } from '../../../shared/services/alert.service';

type SignStep  = 'otp' | 'sign' | 'success';
type SignTab   = 'TYPE' | 'DRAW' | 'UPLOAD';
type FontName  = 'Dancing Script' | 'Great Vibes' | 'Pacifico';

@Component({
  selector: 'app-lease-signature',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgOtpInputModule],
  templateUrl: './lease-signature.component.html',
  styleUrls: ['./lease-signature.component.css'],
})
export class LeaseSignatureComponent implements OnInit, OnDestroy, AfterViewInit {
  private route     = inject(ActivatedRoute);
  private http      = inject(HttpClient);
  private alert     = inject(AlertService);
  private destroy   = inject(DestroyRef);
  private sanitizer = inject(DomSanitizer);
  private BASE      = environment.SERVER_ADDRESS;

  // ── Query params ────────────────────────────────────────────────────────
  leaseId = '';
  role    = '';
  email   = '';

  // ── Steps ───────────────────────────────────────────────────────────────
  step: SignStep = 'otp';

  // ── OTP state ───────────────────────────────────────────────────────────
  otp        = '';
  otpSending = false;
  otpSent    = false;
  otpLoading = false;

  // ── Lease details (returned after OTP verify) ───────────────────────────
  pdfUrl: SafeResourceUrl = '';
  leaseCode    = '';
  tenantName   = '';
  propertyName = '';
  unitName     = '';

  // ── Signature panel ──────────────────────────────────────────────────────
  activeTab: SignTab  = 'DRAW';
  submitLoading       = false;

  // TYPE tab
  typedName    = '';
  selectedFont: FontName = 'Dancing Script';
  fonts: FontName[]      = ['Dancing Script', 'Great Vibes', 'Pacifico'];

  // DRAW tab
  @ViewChild('sigCanvas') sigCanvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  hasDrawn        = false;

  // UPLOAD tab
  uploadedImageSrc: string | null = null;

  // ── Lifecycle ───────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroy)).subscribe(p => {
      this.leaseId = p['lease'] ?? '';
      this.role    = p['role']  ?? '';
      this.email   = p['email'] ?? '';
    });
  }

  ngAfterViewInit(): void {
    // Canvas init happens after switching to 'sign' step via setupCanvas()
  }

  ngOnDestroy(): void {}

  // ── OTP actions ─────────────────────────────────────────────────────────
  onOtpChange(val: string): void {
    this.otp = val;
  }

  sendOtp(): void {
    this.otpSending = true;
    this.http.post(`${this.BASE}/api/lease/signature-otp`, {
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
        error: () => { this.otpSending = false; },
      });
  }

  verifyOtp(): void {
    if (this.otp.length < 6) {
      this.alert.error('Please enter the 6-digit OTP');
      return;
    }
    this.otpLoading = true;
    this.http.post(`${this.BASE}/api/lease/signature-otp-verify`, {
      lease_id: +this.leaseId,
      role:     this.role,
      email:    this.email.trim().toLowerCase(),
      otp:      this.otp,
    }).pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (resp: any) => {
          this.otpLoading = false;
          const c = resp?.content ?? {};
          this.pdfUrl       = this.sanitizer.bypassSecurityTrustResourceUrl(c.pdf_url ?? '');
          this.leaseCode    = c.lease_code    ?? '';
          this.tenantName   = c.tenant_name   ?? '';
          this.propertyName = c.property_name ?? '';
          this.unitName     = c.unit_name     ?? '';
          this.step = 'sign';
          // Init canvas after view updates
          setTimeout(() => this.setupCanvas(), 50);
        },
        error: (err: any) => {
          this.otpLoading = false;
          const msg = err?.error?.message || 'OTP verification failed. Please try again.';
          this.alert.error(msg);
        },
      });
  }

  // ── Canvas drawing ───────────────────────────────────────────────────────
  setupCanvas(): void {
    if (!this.sigCanvasRef) return;
    const canvas = this.sigCanvasRef.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;
    this.ctx = context;
    this.ctx.strokeStyle = '#1a1a2e';
    this.ctx.lineWidth   = 2.5;
    this.ctx.lineCap     = 'round';
    this.ctx.lineJoin    = 'round';
  }

  private getPos(event: MouseEvent | TouchEvent, canvas: HTMLCanvasElement): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    if (event instanceof MouseEvent) {
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top)  * scaleY,
      };
    } else {
      const touch = event.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top)  * scaleY,
      };
    }
  }

  onCanvasMouseDown(event: MouseEvent): void {
    if (!this.ctx) return;
    this.drawing = true;
    const pos = this.getPos(event, this.sigCanvasRef.nativeElement);
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
  }

  onCanvasMouseMove(event: MouseEvent): void {
    if (!this.drawing || !this.ctx) return;
    const pos = this.getPos(event, this.sigCanvasRef.nativeElement);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
    this.hasDrawn = true;
  }

  onCanvasMouseUp(): void { this.drawing = false; }
  onCanvasMouseLeave(): void { this.drawing = false; }

  onCanvasTouchStart(event: TouchEvent): void {
    event.preventDefault();
    if (!this.ctx) return;
    this.drawing = true;
    const pos = this.getPos(event, this.sigCanvasRef.nativeElement);
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
  }

  onCanvasTouchMove(event: TouchEvent): void {
    event.preventDefault();
    if (!this.drawing || !this.ctx) return;
    const pos = this.getPos(event, this.sigCanvasRef.nativeElement);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
    this.hasDrawn = true;
  }

  onCanvasTouchEnd(): void { this.drawing = false; }

  clearCanvas(): void {
    if (!this.ctx || !this.sigCanvasRef) return;
    const canvas = this.sigCanvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.hasDrawn = false;
  }

  // ── Upload tab ───────────────────────────────────────────────────────────
  onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file   = input.files[0];
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.uploadedImageSrc = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  // ── Type tab: render to canvas for export ────────────────────────────────
  private renderTypedSignature(): string {
    const offscreen = document.createElement('canvas');
    offscreen.width  = 400;
    offscreen.height = 120;
    const c = offscreen.getContext('2d')!;
    c.fillStyle = '#ffffff';
    c.fillRect(0, 0, 400, 120);
    c.fillStyle    = '#1a1a2e';
    c.font         = `64px "${this.selectedFont}"`;
    c.textBaseline = 'middle';
    c.textAlign    = 'center';
    c.fillText(this.typedName, 200, 60);
    return offscreen.toDataURL('image/png');
  }

  // ── Confirm signature ─────────────────────────────────────────────────────
  confirmSignature(): void {
    let signatureData: string | null = null;

    if (this.activeTab === 'DRAW') {
      if (!this.hasDrawn) {
        this.alert.error('Please draw your signature first.');
        return;
      }
      signatureData = this.sigCanvasRef.nativeElement.toDataURL('image/png');
    } else if (this.activeTab === 'TYPE') {
      if (!this.typedName.trim()) {
        this.alert.error('Please type your name first.');
        return;
      }
      signatureData = this.renderTypedSignature();
    } else if (this.activeTab === 'UPLOAD') {
      if (!this.uploadedImageSrc) {
        this.alert.error('Please upload a signature image first.');
        return;
      }
      signatureData = this.uploadedImageSrc;
    }

    if (!signatureData) return;

    this.submitLoading = true;
    this.http.post(`${this.BASE}/api/lease/submit-signature`, {
      lease_id:       +this.leaseId,
      role:           this.role,
      email:          this.email.trim().toLowerCase(),
      signature_data: signatureData,
    }).pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          this.submitLoading = false;
          this.step = 'success';
        },
        error: (err: any) => {
          this.submitLoading = false;
          const msg = err?.error?.message || 'Failed to submit signature. Please try again.';
          this.alert.error(msg);
        },
      });
  }

  setTab(tab: SignTab): void {
    this.activeTab = tab;
    if (tab === 'DRAW') {
      setTimeout(() => this.setupCanvas(), 50);
    }
  }

  get roleLabel(): string {
    return this.role === 'owner' ? 'Owner' : 'Tenant';
  }

  get canConfirm(): boolean {
    if (this.activeTab === 'DRAW')   return this.hasDrawn;
    if (this.activeTab === 'TYPE')   return !!this.typedName.trim();
    if (this.activeTab === 'UPLOAD') return !!this.uploadedImageSrc;
    return false;
  }
}
