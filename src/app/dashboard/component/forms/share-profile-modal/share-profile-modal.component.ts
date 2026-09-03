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
import { PropertyService } from '../../../services/property.service';

export type ShareModalType = 'profile' | 'property' | 'unit';

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
  /** Controls which API is called: 'profile' (default), 'property', or 'unit' */
  @Input() apiType: ShareModalType = 'profile';

  private fb = inject(FormBuilder);
  private activeModal = inject(NgbActiveModal);
  private userService = inject(UserService);
  private propertyService = inject(PropertyService);
  private alertService = inject(AlertService);

  form!: FormGroup;
  isLoading = false;

  get modalTitle(): string {
    if (this.apiType === 'property')
      return `Share Property — ${this.profileName}`;
    if (this.apiType === 'unit') return `Share Unit — ${this.profileName}`;
    return `Share Profile — ${this.profileName}`;
  }

  get descriptionLabel(): string {
    if (this.apiType === 'property')
      return `Enter an email address to share <strong>${this.profileName}</strong> property details. They will receive a formatted email with the property details.`;
    if (this.apiType === 'unit')
      return `Enter an email address to share <strong>${this.profileName}</strong> unit details. They will receive a formatted email with the unit details.`;
    return `Enter an email address to share <strong>${this.profileName}'s</strong> profile. They will receive a formatted email with the profile details.`;
  }

  get submitLabel(): string {
    if (this.apiType === 'property') return 'Share Property';
    if (this.apiType === 'unit') return 'Share Unit';
    return 'Share Profile';
  }

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
    const email = this.form.value.recipient_email;
    let request$;

    if (this.apiType === 'property') {
      request$ = this.propertyService.shareProperty({
        property_id: this.profileId,
        recipient_email: email,
      });
    } else if (this.apiType === 'unit') {
      request$ = this.propertyService.shareUnit({
        unit_id: this.profileId,
        recipient_email: email,
      });
    } else {
      request$ = this.userService.shareProfile({
        profile_id: this.profileId,
        recipient_email: email,
      });
    }

    request$.subscribe({
      next: (resp: any) => {
        this.isLoading = false;
        this.alertService.success(resp?.message || 'Shared successfully');
        this.activeModal.close(true);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.alertService.error(err?.error?.message || 'Failed to share');
      },
    });
  }
}
