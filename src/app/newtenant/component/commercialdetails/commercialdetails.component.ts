import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { CustomSelectComponent } from '../../../dashboard/component/custom-select/custom-select.component';
import { ToastService } from '../../../core/toast.service';
import { AlertService } from '../../../shared/services/alert.service';
import { EditIconComponent } from '../../../user/component/icons/edit-icon/edit-icon.component';
import { FormService } from '../../../shared/services/form.service';
import { NoDataComponent } from '../../../no-data/no-data.component';
import { NewTenantFromService } from '../service/new-tenant-from.service';
import { SharedService } from '../../../shared.service';
import { ChargesService } from '../../../charges.service';

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
    NoDataComponent,
  ],
  templateUrl: './commercialdetails.component.html',
  styleUrl: './commercialdetails.component.css',
})
export class CommercialdetailsComponent implements OnInit {
  @Input() form!: FormGroup;

  private destroyRef = inject(DestroyRef);
  private newTenantService = inject(NewTenantFromService);
  isInvalid: FormService['isInvalid'];
  private sharedService = inject(SharedService);
  private chargesService = inject(ChargesService);

  constructor(
    private toastService: ToastService,
    private alertService: AlertService,
    private formService: FormService,
  ) {
    this.isInvalid = this.formService.isInvalid.bind(this.formService);

    // React to unit data arriving after this component has already initialised
    // (happens when the user navigates here before the unit-detail API call completes)
    toObservable(this.newTenantService.getUnitCommercialData())
      .pipe(takeUntilDestroyed(this.destroyRef), filter(u => !!u))
      .subscribe(() => {
        if (this.form) {
          this.prefillFromUnit();
          this.recalculateAnnualFromDates();
        }
      });
  }

  ngOnInit() {
    this.prefillFromUnit();
    this.setupAutoCalculations();
    this.sharedService.initLanguage();
    this.loadCharges();
    this.recalculateAnnualFromDates();
  }

  private loadCharges() {
    this.chargesService.charges()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.charges = (resp?.content ?? []).map((c: any) => ({
            charge_id: c.id,
            label: c.description,
            amount: c.amount,
            tax: c.tax_code ? `VAT @${c.tax_code}%` : 'VAT @Nil',
            vat: c.vat_amount,
            total: c.total_amount,
            checked: true,
            isEdit: false,
          }));
        },
        error: () => { this.charges = []; },
      });
  }

  private prefillFromUnit() {
    const u = this.newTenantService.getUnitCommercialData()();
    if (!u) return;

    const patch: Record<string, any> = {};
    const blank = (ctrl: string) => !this.form.get(ctrl)!.value;

    if (blank('rent') && u.rent) patch['rent'] = parseFloat(u.rent);
    if (blank('securityDeposit') && u.security_deposit)
      patch['securityDeposit'] = parseFloat(u.security_deposit);
    if (blank('securityBookingAmount') && u.booking_amount)
      patch['securityBookingAmount'] = parseFloat(u.booking_amount);
    if (blank('maintenanceCharges') && u.maintenance_charges)
      patch['maintenanceCharges'] = parseFloat(u.maintenance_charges);
    if (blank('paymentCount') && u.cycle)
      patch['paymentCount'] = parseInt(u.cycle, 10);
    if (blank('noticePeriod') && u.notice_period)
      patch['noticePeriod'] = parseInt(u.notice_period, 10);
    if (blank('commissionPercent') && u.commission_percent)
      patch['commissionPercent'] = parseFloat(u.commission_percent);

    if (Object.keys(patch).length) {
      this.form.patchValue(patch, { emitEvent: false });
    }
  }

  private setupAutoCalculations() {
    // annualAmount + actualAnnualAmount: recalculate when any of these three change
    ['startDate', 'endDate', 'rent'].forEach((ctrl) => {
      this.form
        .get(ctrl)!
        .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.recalculateAnnualFromDates());
    });

    // contractAmount: recalculate whenever any of its components change
    ['securityBookingAmount', 'maintenanceCharges', 'securityDeposit'].forEach((ctrl) => {
      this.form
        .get(ctrl)!
        .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.recalculateContractAmount());
    });
  }

  private recalculateAnnualFromDates() {
    const start = this.form.get('startDate')!.value as string;
    const end = this.form.get('endDate')!.value as string;
    const rent = parseFloat(this.form.get('rent')!.value) || 0;

    if (!start || !end || rent <= 0) return;

    const months = this.monthsBetween(start, end);
    if (months <= 0) return;

    const annual = Math.round(rent * months * 100) / 100;

    this.form.patchValue({ annualAmount: annual, actualAnnualAmount: annual });
    this.recalculateContractAmount();
  }

  private recalculateContractAmount() {
    const annual = parseFloat(this.form.get('annualAmount')!.value) || 0;
    const booking = parseFloat(this.form.get('securityBookingAmount')!.value) || 0;
    const maint = parseFloat(this.form.get('maintenanceCharges')!.value) || 0;
    const security = parseFloat(this.form.get('securityDeposit')!.value) || 0;

    this.form.patchValue({
      contractAmount: Math.round((annual + booking + maint + security) * 100) / 100,
    });
  }

  // Parse YYYY-MM-DD strings directly to avoid new Date() timezone shifting
  private monthsBetween(startStr: string, endStr: string): number {
    const [sy, sm] = startStr.split('-').map(Number);
    const [ey, em] = endStr.split('-').map(Number);
    return (ey - sy) * 12 + (em - sm);
  }

  charges: any[] = [];
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
