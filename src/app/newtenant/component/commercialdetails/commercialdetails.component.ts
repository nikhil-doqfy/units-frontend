import { Component, Input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { CustomSelectComponent } from '../../../dashboard/component/custom-select/custom-select.component';
import { ToastService } from '../../../core/toast.service';
import { AlertService } from '../../../shared/services/alert.service';
import { EditIconComponent } from '../../../user/component/icons/edit-icon/edit-icon.component';
import { FormService } from '../../../shared/services/form.service';

@Component({
  selector: 'app-commercialdetails',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    WhiteCardComponent,
    TranslateModule,
    CommonModule,
    FormsModule,
    CustomSelectComponent,
    EditIconComponent,
  ],
  templateUrl: './commercialdetails.component.html',
  styleUrl: './commercialdetails.component.css',
})
export class CommercialdetailsComponent {
  @Input() form!: FormGroup;

  isInvalid: FormService['isInvalid'];

  constructor(
    private toastService: ToastService,
    private alertService: AlertService,
    private formService: FormService,
  ) {
    this.isInvalid = this.formService.isInvalid.bind(this.formService);
  }
  charges = [
    {
      label: 'Admin Fee',
      amount: 32.71,
      tax: 'VAT @5%',
      vat: 1.64,
      total: 34.35,
      checked: true,
      isEdit: false,
    },
    {
      label: 'Ejari Charge Disbursement',
      amount: 175.65,
      tax: 'VAT @Nil',
      vat: 0,
      total: 175.65,
      checked: true,
      isEdit: false,
    },
    {
      label: 'Gas Charges',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: true,
      isEdit: false,
    },
    {
      label: 'COMMISSION- DUBAI',
      amount: 1200,
      tax: 'VAT @5%',
      vat: 60,
      total: 1260,
      checked: true,
      isEdit: false,
    },
    {
      label: 'Security Deposit',
      amount: 2400,
      tax: 'VAT @Nil',
      vat: 0,
      total: 2400,
      checked: true,
      isEdit: false,
    },
    {
      label: 'CAR PARKING',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: true,
      isEdit: false,
    },
    {
      label: 'TAWTHEEQ REGISTRATION A/C...',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: true,
      isEdit: false,
    },
    {
      label: 'RENEWAL COMMISSION (DUBAI)',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: false,
      isEdit: false,
    },
    {
      label: 'RENEWAL COMMISSION (SHARJ...)',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: false,
      isEdit: false,
    },
    {
      label: 'R COMMISSION- ABU DHABI BL...',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: false,
      isEdit: false,
    },
    {
      label: 'TAWTHEEQ SERVICE INCOME- A...',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: false,
      isEdit: false,
    },
  ];
  get totalAmount(): number {
    return this.charges
      .filter((c) => c.checked)
      .reduce((sum, c) => sum + c.total, 0);
  }
  sendInvite() {
    this.alertService.customSuccess('Invite Sent Successfully');
  }
  /*-------OTHER CHARGES ACTION  COLUMN------------------------*/
  editRow(row: any) {
    console.log('clicked', row);
    row.isEdit = true;
  }

  saveRow(row: any) {
    console.log('saved', row);
    row.isEdit = false;
  }
}
