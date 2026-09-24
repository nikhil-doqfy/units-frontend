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
          this.syncChargesToService();
        }
      });
  }

  ngOnInit() {
    this.prefillFromUnit();
    this.setupAutoCalculations();
    this.sharedService.initLanguage();
    this.loadCharges();
    this.recalculateAnnualFromDates();
    this.syncChargesToService();
  }

  // These labels are always shown as their own field-derived rows (see
  // fieldDerivedCharges below), sourced directly from this form's own
  // Security/Booking Amount, Maintenance Charges, Security Deposit and
  // Commission fields. If a Charge in the Charges master list happens to
  // share one of these exact names (e.g. seeded/entered by mistake), it
  // must be excluded from the checklist here -- otherwise the same line
  // item appears twice, once from each source, with two different (and
  // unrelated) amounts.
  private static readonly RESERVED_FIELD_CHARGE_LABELS = new Set([
    'security/booking amount',
    'maintenance charges',
    'security deposit',
    'commission',
  ]);

  private loadCharges() {
    this.chargesService.charges()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.charges = (resp?.content ?? [])
            .filter((c: any) =>
              !CommercialdetailsComponent.RESERVED_FIELD_CHARGE_LABELS.has(
                (c.description || '').trim().toLowerCase(),
              ),
            )
            .map((c: any) => ({
              charge_id: c.id,
              label: c.description,
              amount: c.amount,
              tax: c.tax_code ? `VAT @${c.tax_code}%` : 'VAT @Nil',
              vat: c.vat_amount,
              total: c.total_amount,
              checked: true,
              isEdit: false,
            }));
          this.syncChargesToService();
        },
        error: () => { this.charges = []; },
      });
  }

  private syncChargesToService() {
    const moduleCharges = this.charges
      .filter(c => c.checked)
      .map(c => ({ charge_id: c.charge_id, amount: c.amount }));
    // Commercial-details fields (Security/Booking Amount, Maintenance
    // Charges, Security Deposit, Commission) surfaced as charge lines --
    // identified by description since they aren't Charges-section rows.
    // Discount is excluded: it's a deduction, not a taxable charge, and
    // stays purely on Lease.discount.
    const fieldCharges = this.fieldDerivedCharges
      .filter(c => c.description)
      .map(c => ({ description: c.label, amount: c.amount }));
    this.newTenantService.setSelectedCharges([...moduleCharges, ...fieldCharges]);
  }

  /** Commercial-details field values mirrored as read-only Other Charges
   * rows, each with a flat 5% VAT for display. Discount is shown as a
   * negative, VAT-free row for visibility only -- see syncChargesToService. */
  get fieldDerivedCharges(): any[] {
    if (!this.form) return [];
    const v = this.form.value;
    const vatRate = 0.05;
    const rows: any[] = [];

    const pushChargeRow = (label: string, amount: number) => {
      if (!amount) return;
      const vat = Math.round(amount * vatRate * 100) / 100;
      rows.push({
        label,
        amount,
        tax: 'VAT @5%',
        vat,
        total: Math.round((amount + vat) * 100) / 100,
        description: label,
      });
    };

    pushChargeRow('Security/Booking Amount', parseFloat(v.securityBookingAmount) || 0);
    pushChargeRow('Maintenance Charges', parseFloat(v.maintenanceCharges) || 0);
    pushChargeRow('Security Deposit', parseFloat(v.securityDeposit) || 0);

    const rent = parseFloat(v.rent) || 0;
    const commissionPercent = parseFloat(v.commissionPercent) || 0;
    const commissionAmount = Math.round(((rent * commissionPercent) / 100) * 100) / 100;
    pushChargeRow('Commission', commissionAmount);

    const discount = parseFloat(v.discount) || 0;
    if (discount) {
      rows.push({
        label: 'Discount',
        amount: -discount,
        tax: 'VAT @Nil',
        vat: 0,
        total: -discount,
        description: null,
      });
    }

    return rows;
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

    // Other Charges: keep the field-derived rows (and the payload sent on
    // save) in sync whenever any of the fields they mirror change.
    ['securityBookingAmount', 'maintenanceCharges', 'securityDeposit', 'commissionPercent', 'rent', 'discount'].forEach((ctrl) => {
      this.form
        .get(ctrl)!
        .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.syncChargesToService());
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
    const moduleTotal = this.charges
      .filter((c) => c.checked)
      .reduce((sum, c) => sum + c.total, 0);
    const fieldTotal = this.fieldDerivedCharges.reduce((sum, c) => sum + c.total, 0);
    return Math.round((moduleTotal + fieldTotal) * 100) / 100;
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
    row.isEdit = false;
    this.syncChargesToService();
  }

  onChargeToggle() {
    this.syncChargesToService();
  }
}
