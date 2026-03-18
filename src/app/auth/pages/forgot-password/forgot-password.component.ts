import {
  Component,
  DestroyRef,
  inject,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService, UserRole } from '../../../theme.service';
import { NgOtpInputModule } from 'ng-otp-input';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AuthTitleComponent } from '../../component/auth-title/auth-title.component';
import { AuthFormComponent } from '../../component/auth-form/auth-form.component';
import { EmailIconComponent } from '../../component/icons/email-icon/email-icon.component';
import { NewUserLinkComponent } from '../../component/new-user-link/new-user-link.component';
import { TimerTextComponent } from '../../component/timer-text/timer-text.component';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../../shared/services/alert.service';
import { StorageService } from '../../../shared/services/storage.service';
import { FormsModule } from '@angular/forms';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CrossIconComponent } from '../../../dashboard/component/icons/cross-icon/cross-icon.component';
import { FormService } from '../../../shared/services/form.service';
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    NgOtpInputModule,
    AuthTitleComponent,
    AuthFormComponent,
    EmailIconComponent,
    NewUserLinkComponent,
    TimerTextComponent,
    FormsModule,
    ReactiveFormsModule,
    CrossIconComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  @ViewChild('otpVerifyContent') otpVerifyContent!: TemplateRef<any>;
  private formService = inject(FormService);
  forgetForm!: FormGroup;
  showPassword = false;
  currentRole: UserRole = 'owner';
  otp = '';
  email = '';
  private modalService = inject(NgbModal);
  private destroyRef = inject(DestroyRef);

  isInvalid = this.formService.isInvalid;
  closeResult = '';
  otpSent = false;
  otpTimer = 0;
  emailLocked = false;
  timerDisplay = '1:00';
  timerInterval: any;
  showResend = false;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private themeService: ThemeService,
    private authService: AuthService,
    private storageService: StorageService,
    private alertService: AlertService
  ) {
    this.themeService.currentRole$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((role) => {
        this.currentRole = role;
      });
  }

  ngOnInit(): void {
    this.forgetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onOtpChange(evt: any) {
    console.log(evt);
    this.otp = evt;
  }

  goToLogin(): void {
    this.modalService.dismissAll();
    this.router.navigate(['auth/login']);
  }
  goToResetPassword(): void {
    this.modalService.dismissAll();
    this.router.navigate(['auth/reset-password'], {
      state: { email: this.forgetForm.get('email')?.value, otp: this.otp },
    });
  }
  sendOtp(): void {
    if (this.forgetForm.invalid) {
      this.forgetForm.markAllAsTouched();
      return;
    }

    let payload = {
      email: this.forgetForm.value.email,
      purpose: 'reset_password',
    };
    this.authService
      .sendOtp(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.alertService.success(resp?.message || 'OTP sent successfully');
          this.otpSent = true;
          this.emailLocked = true;

          this.openOtpVerifyModal(this.otpVerifyContent);
        },
        error: (err) => {
          console.log('OTP error:--->', err);
          this.alertService.error(err?.error?.message || 'Failed to send OTP');
        },
      });
  }

  openOtpVerifyModal(otpVerifyContent: TemplateRef<any>) {
    const modalRef = this.modalService.open(otpVerifyContent, {
      windowClass: 'otpVerifyMdl',
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });
    this.otpTimer = 60;
    this.startOtpTimer();
    modalRef.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
        this.goToResetPassword();
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );

    this.startOtpTimer();
  }

  private getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.ESC:
        return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK:
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }

  private startOtpTimer(): void {
    this.otpSent = true;
    this.showResend = false;
    this.otpTimer = 60;

    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      this.otpTimer--;
      const minutes = Math.floor(this.otpTimer / 60);
      const seconds = this.otpTimer % 60;
      this.timerDisplay = `${minutes}:${
        seconds < 10 ? '0' + seconds : seconds
      }`;

      if (this.otpTimer <= 0) {
        clearInterval(this.timerInterval);
        this.showResend = true;
      }
    }, 1000);
  }

  resendOtp(): void {
    this.startOtpTimer();
  }

  signInWithOtp(): void {
    let payload = {
      email: this.forgetForm.value.email,
      otp: Number(this.otp),
    };
    this.authService
      .verifyOtp(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.goToResetPassword();
          this.alertService.success('Login successful');
        },
        error: (err) => {
          console.log('OTP verify error: ', err);
          this.alertService.error(err?.error?.message || 'Invalid OTP');
        },
      });
  }
}
