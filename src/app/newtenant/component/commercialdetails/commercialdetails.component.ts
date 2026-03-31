import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { CustomSelectComponent } from '../../../dashboard/component/custom-select/custom-select.component';
import { ToastService } from '../../../core/toast.service';
import { AlertService } from '../../../shared/services/alert.service';
import { EditIconComponent } from '../../../user/component/icons/edit-icon/edit-icon.component';
import { FormService } from '../../../shared/services/form.service';
import { NewTenantFromService } from '../service/new-tenant-from.service';

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
export class CommercialdetailsComponent implements OnInit {
  @Input() form!: FormGroup;

  private destroyRef = inject(DestroyRef);
  private newTenantService = inject(NewTenantFromService);
  isInvalid: FormService['isInvalid'];

  constructor(
    private toastService: ToastService,
    private alertService: AlertService,
    private formService: FormService,
  ) {
    this.isInvalid = this.formService.isInvalid.bind(this.formService);
  }

  ngOnInit() {
    this.prefillFromUnit();
    this.setupAutoCalculations();
  }

  private prefillFromUnit() {
    const u = this.newTenantService.getUnitCommercialData()();
    if (!u) return;

    const patch: Record<string, any> = {};
    const blank = (ctrl: string) => !this.form.get(ctrl)!.value;

    if (blank('rent')                 && u.rent)               patch['rent']                 = parseFloat(u.rent);
    if (blank('securityDeposit')      && u.security_deposit)   patch['securityDeposit']      = parseFloat(u.security_deposit);
    if (blank('securityBookingAmount')&& u.booking_amount)     patch['securityBookingAmount']= parseFloat(u.booking_amount);
    if (blank('maintenanceCharges')   && u.maintenance_charges)patch['maintenanceCharges']   = parseFloat(u.maintenance_charges);
    if (blank('paymentCount')         && u.cycle)              patch['paymentCount']         = parseInt(u.cycle, 10);
    if (blank('noticePeriod')         && u.notice_period)      patch['noticePeriod']         = parseInt(u.notice_period, 10);
    if (blank('commissionPercent')    && u.commission_percent) patch['commissionPercent']    = parseFloat(u.commission_percent);

    if (Object.keys(patch).length) {
      this.form.patchValue(patch, { emitEvent: false });
    }
  }

  private setupAutoCalculations() {
    // annualAmount + actualAnnualAmount: derived from startDate + endDate (rent × months)
    this.form.get('startDate')!.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalculateAnnualFromDates());

    this.form.get('endDate')!.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalculateAnnualFromDates());

    // contractAmount: recalculate whenever any of its components change
    const contractTriggers = ['securityBookingAmount', 'maintenanceCharges', 'securityDeposit'];
    contractTriggers.forEach((ctrl) => {
      this.form.get(ctrl)!.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.recalculateContractAmount());
    });
  }

  private recalculateAnnualFromDates() {
    const start = this.form.get('startDate')!.value;
    const end   = this.form.get('endDate')!.value;
    const rent  = parseFloat(this.form.get('rent')!.value) || 0;

    if (!start || !end || rent <= 0) return;

    const months = this.monthsBetween(new Date(start), new Date(end));
    if (months <= 0) return;

    const annual = Math.round(rent * months * 100) / 100;

    this.form.get('annualAmount')!.setValue(annual, { emitEvent: false });
    this.form.get('actualAnnualAmount')!.setValue(annual, { emitEvent: false });
    this.recalculateContractAmount();
  }

  private recalculateContractAmount() {
    const annual   = parseFloat(this.form.get('annualAmount')!.value)          || 0;
    const booking  = parseFloat(this.form.get('securityBookingAmount')!.value) || 0;
    const maint    = parseFloat(this.form.get('maintenanceCharges')!.value)    || 0;
    const security = parseFloat(this.form.get('securityDeposit')!.value)       || 0;

    this.form.get('contractAmount')!.setValue(
      Math.round((annual + booking + maint + security) * 100) / 100,
      { emitEvent: false },
    );
  }

  private monthsBetween(start: Date, end: Date): number {
    return (end.getFullYear() - start.getFullYear()) * 12
         + (end.getMonth() - start.getMonth());
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
