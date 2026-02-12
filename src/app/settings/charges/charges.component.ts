import { Component } from '@angular/core';
import { WhiteCardComponent } from '../../shared/component/white-card/white-card.component';
import { CommonModule } from '@angular/common';
import { TableTitleComponent } from '../../dashboard/component/table-title/table-title.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { PlusIconComponent } from '../../shared/component/icons/plus-icon/plus-icon.component';
import { EditIconComponent } from '../../dashboard/component/icons/edit-icon/edit-icon.component';
import { DeleteIconComponent } from '../../dashboard/component/icons/delete-icon/delete-icon.component';

@Component({
  selector: 'app-charges',
  standalone: true,
  imports: [
    WhiteCardComponent,
    CommonModule,
    TableTitleComponent,
    TranslateModule,
    CommonModule,
    FormsModule,
    PlusIconComponent,
    EditIconComponent,
    DeleteIconComponent,
  ],
  templateUrl: './charges.component.html',
  styleUrl: './charges.component.css',
})
export class ChargesComponent {
  currentLanguage = 'en';

  charges = [
    {
      label: 'Admin Fee',
      amount: 32.71,
      tax: 'VAT @5%',
      vat: 1.64,
      editable: true,
      total: 34.35,
      checked: true,
    },
    {
      label: 'Ejari Charge Disbursement',
      amount: 175.65,
      tax: 'VAT @Nil',
      vat: 0,
      editable: true,
      total: 175.65,
      checked: true,
    },
    {
      label: 'Gas Charges',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      editable: true,
      total: 1050,
      checked: true,
    },
    {
      label: 'COMMISSION- DUBAI',
      amount: 1200,
      tax: 'VAT @5%',
      vat: 60,
      total: 1260,
      checked: true,
    },
    {
      label: 'Security Deposit',
      amount: 2400,
      tax: 'VAT @Nil',
      vat: 0,
      total: 2400,
      checked: true,
    },
    {
      label: 'CAR PARKING',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: true,
    },
    {
      label: 'TAWTHEEQ REGISTRATION A/C...',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: true,
    },
    {
      label: 'RENEWAL COMMISSION (DUBAI)',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: false,
    },
    {
      label: 'RENEWAL COMMISSION (SHARJ...)',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: false,
    },
    {
      label: 'R COMMISSION- ABU DHABI BL...',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: false,
    },
    {
      label: 'TAWTHEEQ SERVICE INCOME- A...',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: false,
    },
  ];
  get totalAmount(): number {
    return this.charges
      .filter((c) => c.checked)
      .reduce((sum, c) => sum + c.total, 0);
  }
  hovering = false;
}
