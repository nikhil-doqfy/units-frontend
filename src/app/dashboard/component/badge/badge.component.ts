import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PendingIconComponent } from '../../../icons/pending-icon/pending-icon.component';
import { AmountCreditedIconComponent } from '../../../icons/amount-credited-icon/amount-credited-icon.component';
import { DisableIconComponent } from '../../../icon/disable-icon/disable-icon.component';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [
    CommonModule,

    PendingIconComponent,
    AmountCreditedIconComponent,
    DisableIconComponent,
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
