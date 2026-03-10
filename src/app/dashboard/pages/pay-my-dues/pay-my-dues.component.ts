import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { PaypalIconComponent } from '../../component/icons/paypal-icon/paypal-icon.component';
import { DashFormComponent } from '../../../shared/component/dash-form/dash-form.component';
import { PlusIconComponent } from '../../../shared/component/icons/plus-icon/plus-icon.component';
import { MinusIconComponent } from '../../component/icons/minus-icon/minus-icon.component';
import { SharedService } from '../../../shared.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pay-my-dues',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    WhiteCardComponent,
    PaypalIconComponent,
    DashFormComponent,
    PlusIconComponent,
    MinusIconComponent,
    TranslateModule,
  ],
  templateUrl: './pay-my-dues.component.html',
  styleUrl: './pay-my-dues.component.css',
})
export class PayMyDuesComponent {
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Payments & Invoice', link: '/dashboard/payments-and-invoice' },
    { label: 'Pay my Dues', link: '' },
  ];

  paymentMethodView: 'credit-Debit-card' | 'NEFT-bank-transfer' | 'PayPal' =
    'credit-Debit-card';
  quantity: number = 1;

  constructor(private router: Router) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
  }

  ngOnInit() {
    this.paymentMethodView = 'credit-Debit-card';
  }

  increaseQty() {
    this.quantity++;
  }

  decreaseQty() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  goToPaymentsAndInvoice(): void {
    this.router.navigate(['dashboard/payments-and-invoice']);
  }
}
