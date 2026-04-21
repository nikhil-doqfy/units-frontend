import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../../../user/services/user.service';
import { AlertService } from '../../../../shared/services/alert.service';

@Component({
  selector: 'app-share-profile-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './share-profile-modal.component.html',
  styleUrl: './share-profile-modal.component.css',
})
export class ShareProfileModalComponent implements OnInit {
  @Input() profileId!: number;
  @Input() profileName!: string;

  private fb = inject(FormBuilder);
  private activeModal = inject(NgbActiveModal);
  private userService = inject(UserService);
  private alertService = inject(AlertService);

  form!: FormGroup;
  isLoading = false;

  ngOnInit(): void {
    this.form = this.fb.group({
      recipient_email: ['', [Validators.required, Validators.email]],
    });
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.userService
      .shareProfile({
        profile_id: this.profileId,
        recipient_email: this.form.value.recipient_email,
      })
      .subscribe({
        next: (resp: any) => {
          this.isLoading = false;
          this.alertService.success(resp?.message || 'Profile shared successfully');
          this.activeModal.close(true);
        },
        error: (err: any) => {
          this.isLoading = false;
          this.alertService.error(err?.error?.message || 'Failed to share profile');
        },
      });
  }
}
