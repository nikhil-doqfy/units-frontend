import { Component, inject, TemplateRef } from '@angular/core';
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
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  currentRole: UserRole = 'owner';
  private modalService = inject(NgbModal);

  constructor(private router: Router, private themeService: ThemeService) {
    this.themeService.currentRole$.subscribe(role => {
      this.currentRole = role;
    });
  }
  closeResult = '';
  otpSent = false;
  otpTimer = 0;
  timerDisplay = '1:00';
  timerInterval: any;
  showResend = false;

  onOtpChange(evt: any) { }

  goToLogin(): void {
    this.modalService.dismissAll();
    this.router.navigate(['auth/login']);
  }

  goToResetPassword(): void {
    this.modalService.dismissAll();
    this.router.navigate(['auth/reset-password']);
  }

  openOtpVerifyModal(otpVerifyContent: TemplateRef<any>) {
    const modalRef = this.modalService.open(otpVerifyContent, {
      windowClass: 'otpVerifyMdl',
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
        this.goToResetPassword();
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );

    // Start OTP timer when modal opens
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
      this.timerDisplay = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

      if (this.otpTimer <= 0) {
        clearInterval(this.timerInterval);
        this.showResend = true;
      }
    }, 1000);
  }

  resendOtp(): void {
    // You can call API here to resend OTP
    this.startOtpTimer();
  }
}
