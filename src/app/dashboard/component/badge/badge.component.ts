import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WarningIconComponent } from '../../../icons/warning-icon/warning-icon.component';
import { InfoIconComponent } from '../icons/info-icon/info-icon.component';
import { CheckIconComponent } from '../../../icons/check-icon/check-icon.component';
import { SuccessIconComponent } from '../../../icons/success-icon/success-icon.component';
import { CloseIconComponent } from '../../../icons/close-icon/close-icon.component';
import { PendingIconComponent } from '../../../icons/pending-icon/pending-icon.component';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [
    CommonModule,
    WarningIconComponent,
    InfoIconComponent,
    CheckIconComponent,
    SuccessIconComponent,
    CloseIconComponent,
    PendingIconComponent,
  ],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.css',
})
export class BadgeComponent {
  @Input() title: string | undefined;
  @Input() status: string | undefined;
  @Input() enableBg: boolean = false;
  @Input() showIcon: boolean = false;
}
