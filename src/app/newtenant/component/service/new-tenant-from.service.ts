import { computed, Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { NewTenant } from '../modules/new-tenant';
import { CommercialdetailsComponent } from '../commercialdetails/commercialdetails.component';
import { BasicpersonalComponent } from '../basicpersonal/basicpersonal.component';
import { ProfileComponent } from '../profile/profile.component';
import { OnboardingComponent } from '../onboarding/onboarding.component';
import { AgreementComponent } from '../agreement/agreement.component';
import { EjariDocComponent } from '../ejari-doc/ejari-doc.component';
import { EjariDocSignatureComponent } from '../ejari-doc-signature/ejari-doc-signature.component';
import { LeaseService } from '../../../dashboard/services/lease.service';
import { AlertService } from '../../../shared/services/alert.service';

@Injectable({
  providedIn: 'root',
})
export class NewTenantFromService {
  private steps = signal<NewTenant[]>([]);
  private activeIndex = signal<number>(0);
  private activeSubIndex = signal<number>(0);
  private leaseId = signal<number | null>(null);

  getLeaseId() { return this.leaseId; }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private leaseService: LeaseService,
    private alertService: AlertService,
  ) {}

  PropertySteps(leadData?: any) {
    return signal<NewTenant[]>([
      {
        id: '1',
        title: 'Invite',
        subSteps: [
          {
            id: '1-1',
            title: 'Property details',
            description: 'Fill all the fields to add create your lease',
            component: BasicpersonalComponent,
            formGroup: this.createBasicForm(leadData),
            inputs: { leadData: leadData ?? null },
            saveButtonDetails: {
              title: 'Save & Next',
              buttonType: 'SIMPLE',
              onClick: () => this.handleMainButtonClick(),
            },
          },
          {
            id: '1-2',
            title: 'Commercial Details',
            description: 'Fill all the fields to add create your lease',
            component: CommercialdetailsComponent,
            formGroup: this.createCommercialForm(),
          },
        ],
      },
      {
        id: '2',
        title: 'Onboarding',
        subSteps: [
          {
            id: '2-1',
            title: 'Profile',
            component: ProfileComponent,
            formGroup: this.createProfileForm(),
          },
          {
            id: '2-2',
            title: 'Profile',
            component: OnboardingComponent,
            formGroup: this.createOnboardingForm(),
          },
        ],
      },
      {
        id: '3',
        title: 'Agreement',
        subSteps: [
          {
            id: '3-1',
            title: 'Profile',
            component: AgreementComponent,
            formGroup: this.createBasicForm(),
            saveButtonDetails: {
              title: 'Send for Signature',
              buttonType: 'SIMPLE',
              onClick: () => this.handleMainButtonClick(),
            },
          },
        ],
      },
      {
        id: '4',
        title: 'Ejari',
        subSteps: [
          {
            id: '4-1',
            title: 'Profile',
            component: EjariDocComponent,
            formGroup: this.createCommercialForm(),
            saveButtonDetails: {
              title: 'Send for Signature',
              buttonType: 'SIMPLE',
              onClick: () => this.startEjariFlow(),
            },
          },
          {
            id: '4-2',
            title: 'Profile',
            component: EjariDocSignatureComponent,
            formGroup: this.createCommercialForm(),
            saveButtonDetails: {
              title: 'Send for Signature',
              buttonType: 'SIMPLE',
              onClick: () => this.ejariDoc(),
            },
          },
        ],
      },
      {
        id: '5',
        title: 'Activated',
      },
    ]);
  }

  getActiveIndex() {
    return this.activeIndex;
  }

  getActiveSubIndex() {
    return this.activeSubIndex;
  }
  private createBasicForm(leadData?: any): FormGroup {
    return this.fb.group({
      // Platform
      platform: [leadData?.platform ?? ''],

      // Section 01 — Leased Unit
      property:  [leadData?.property_id ? { key: leadData.property_id, value: leadData.property_name } : ''],
      block:     [leadData?.block_id    ? { key: leadData.block_id,    value: leadData.block_name    } : ''],
      unit:      [leadData?.unit_id     ? { key: leadData.unit_id,     value: leadData.unit_name     } : ''],
      unitName:  [leadData?.unit_name   ?? ''],
      unitSize:  [leadData?.unit_size   ?? ''],
      landNo:    [leadData?.land_no     ?? ''],
      dmNo:      [leadData?.dm_no       ?? ''],
      unitUsage: [leadData?.unit_usage  ?? ''],
      unitType:  [leadData?.unit_type   ?? ''],
      subType:   [leadData?.sub_type    ?? ''],
      makaniNo:  [leadData?.makani_no   ?? ''],
      floorNo:   [leadData?.floor_no    ?? ''],

      // Section 02 — Tenant
      tenantId:       [leadData?.tenant_id ?? null],
      email:          [leadData?.email ?? ''],
      tenantName:     [leadData?.name ?? ''],
      nationality:    [''],
      passportNo:     [''],
      passportExpiry: [''],
      emiratesId:     [''],
      visaNo:         [''],
      visaExpiry:     [''],
      telNo:          [leadData?.contact_number ?? ''],
      addressLine1:   [''],
      addressLine2:   [''],

      // Section 03 — Owner Details (FormArray)
      unitOwners: this.fb.array(
        leadData?.unit_owners?.length
          ? leadData.unit_owners.map((o: any) => this.createOwnerGroup(o))
          : [this.createOwnerGroup()],
      ),
    });
  }

  createOwnerGroup(o?: any): FormGroup {
    return this.fb.group({
      ownerName:      [o?.name                 ?? ''],
      ownerEmail:     [o?.email                ?? ''],
      ownerContact:   [o?.contact_number       ?? ''],
      ownerEmiratesId:[o?.emirates_id          ?? ''],
      ownerNumber:    [o?.owner_number         ?? ''],
      tradeLicenseNo: [o?.trade_license_number ?? ''],
      licenseNumber:  [o?.license_number       ?? ''],
      licenseExpiry:  [o?.license_expiry_date ? String(o.license_expiry_date).slice(0, 10) : ''],
      licenseIssuer:  [o?.license_issuer       ?? ''],
      faxNo:          [o?.fax_number           ?? ''],
      poBox:          [o?.po_box_number        ?? ''],
    });
  }

  private createCommercialForm(): FormGroup {
    return this.fb.group({
      startDate:            [''],
      endDate:              [''],
      graceStartDate:       [''],
      graceEndDate:         [''],
      annualAmount:         [''],
      actualAnnualAmount:   [''],
      securityBookingAmount:[''],
      maintenanceCharges:   [''],
      rent:                 [''],
      securityDeposit:      [''],
      commissionPercent:    [''],
      noticePeriod:         [''],
      contractAmount:       [''],
      discount:             [''],
      shellAndCore:         [''],
      paymentCount:         [''],
    });
  }

  private createProfileForm(): FormGroup {
    return this.fb.group({
      companyName: [''],
      tradeLicense: [''],
      vatNumber: [''],
    });
  }
  private createOnboardingForm(): FormGroup {
    return this.fb.group({
      companyName: [''],
      tradeLicense: [''],
      vatNumber: [''],
    });
  }

  /* ================= FORMS ================= */

  private showCheckSection = signal(false);

  getShowCheckSection() {
    return this.showCheckSection;
  }
  private showMsg = signal(false);
  private msgText = signal('');
  private btnTitle = signal<
    | 'Send Negotiation'
    | 'Cheque Request'
    | 'Save & Next'
    | 'Send for Signature'
    | 'Submit for Ejari'
    | 'Approval & Generate Invoice'
  >('Send Negotiation');
  private showRefresh = signal(false);
  showRefresh$ = computed(() => this.showRefresh());
  private stepPhase = signal<'NEGOTIATION' | 'CHEQUE' | 'FINAL'>('NEGOTIATION');
  private agreementPhase = signal<'INIT' | 'SIGNING' | 'SIGNED'>('INIT');
  private ejariPhase = signal<'INIT' | 'SIGNING' | 'SIGNED'>('INIT');
  getShowMsg() {
    return this.showMsg;
  }

  getMsgText() {
    return this.msgText;
  }

  getBtnTitle() {
    return this.btnTitle;
  }

  // handleMainButtonClick(goNext?: () => void) {
  //   if (this.stepPhase() === 'NEGOTIATION') {
  //     this.triggerNegotiation();
  //   } else if (this.stepPhase() === 'CHEQUE') {
  //     this.triggerChequeRequest();
  //   } else if (this.agreementPhase() !== 'SIGNED') {
  //     this.triggerAgreementSignature(goNext!);
  //   } else {
  //     this.triggerEjariSignature(goNext);
  //   }
  // }

  handleMainButtonClick(goNext?: () => void, type?: 'AGREEMENT' | 'EJARI') {
    if (type === 'AGREEMENT') {
      this.triggerAgreementSignature(goNext!);
      return;
    }

    if (type === 'EJARI') {
      this.triggerEjariSignature(goNext);
      return;
    }

    if (this.stepPhase() === 'NEGOTIATION') {
      this.triggerNegotiation();
    } else if (this.stepPhase() === 'CHEQUE') {
      this.triggerChequeRequest();
    }
  }

  private triggerNegotiation() {
    this.msgText.set('Waiting for Negotiation');
    this.btnTitle.set('Cheque Request');
    this.showMsg.set(true);

    setTimeout(() => {
      this.showMsg.set(false);
      this.btnTitle.set('Cheque Request');
      this.stepPhase.set('CHEQUE');
    }, 3000);
  }

  private triggerChequeRequest() {
    this.msgText.set('Waiting for Cheque');
    this.btnTitle.set('Save & Next');
    this.showMsg.set(true);

    setTimeout(() => {
      this.showMsg.set(false);
      this.btnTitle.set('Save & Next');
      this.showCheckSection.set(true);
      this.stepPhase.set('FINAL');
    }, 3000);
  }
  startAgreementFlow() {
    this.btnTitle.set('Send for Signature');
    this.agreementPhase.set('INIT');
    this.showMsg.set(false);
    this.msgText.set('');
  }

  triggerAgreementSignature(goNext: () => void) {
    if (this.agreementPhase() === 'INIT') {
      this.msgText.set('Waiting for Signature');
      this.showMsg.set(true);
      this.btnTitle.set('Submit for Ejari');
      this.agreementPhase.set('SIGNING');

      setTimeout(() => {
        this.msgText.set('Signed Successfully');
        this.agreementPhase.set('SIGNED');

        setTimeout(() => {
          this.showMsg.set(false);
        }, 2000);
      }, 3000);
    } else if (this.agreementPhase() === 'SIGNED') {
      goNext();
    }
  }

  triggerEjariSignature(goNext?: () => void) {
    if (this.ejariPhase() === 'INIT') {
      this.msgText.set('Waiting for Signature');
      this.showMsg.set(true);
      this.btnTitle.set('Approval & Generate Invoice');
      this.ejariPhase.set('SIGNING');

      setTimeout(() => {
        this.msgText.set('Signed Successfully');
        this.ejariPhase.set('SIGNED');

        setTimeout(() => {
          this.showMsg.set(false);
        }, 2000);
      }, 3000);
    } else if (this.ejariPhase() === 'SIGNED') {
      goNext?.();
    }
  }
  ejariDoc() {
    this.btnTitle.set('Send for Signature');

    this.msgText.set('');
    this.showMsg.set(false);
    this.ejariPhase.set('INIT');
  }
  startEjariFlow() {
    this.btnTitle.set('Send for Signature');
  }
  saveBasicStep(basicForm: FormGroup, onSuccess?: () => void) {
    const v = basicForm.value;
    const propertyId = v.unit?.key ?? v.unit ?? null;

    if (!propertyId) {
      onSuccess?.();
      return;
    }

    const payload: Record<string, any> = {
      unit_id: propertyId,
      tenant_id: v.tenantId ?? null,
      email: v.email ?? '',
      tenant_name: v.tenantName ?? '',
      contact_number: v.telNo ?? '',
      emirates_id: v.emiratesId ?? '',
      passport_number: v.passportNo ?? '',
      passport_expiry_date: v.passportExpiry ?? '',
      visa_number: v.visaNo ?? '',
      visa_expiry_date: v.visaExpiry ?? '',
      address_line_1: v.addressLine1 ?? '',
      address_line_2: v.addressLine2 ?? '',
    };
    const existingId = this.leaseId();

    const req$ = existingId
      ? this.leaseService.updateLease({ ...payload, lease_id: existingId })
      : this.leaseService.createLease(payload);

    req$.subscribe({
      next: (resp: any) => {
        if (resp?.content?.id) this.leaseId.set(resp.content.id);
        onSuccess?.();
      },
      error: () => {
        // Proceed anyway so the user isn't stuck
        onSuccess?.();
      },
    });
  }

  saveCommercialStep(commercialForm: FormGroup, onSuccess?: () => void) {
    const v = commercialForm.value;
    const existingId = this.leaseId();

    const payload: Record<string, any> = {
      start_date: v.startDate || null,
      end_date: v.endDate || null,
      grace_start_date: v.graceStartDate || null,
      grace_end_date: v.graceEndDate || null,
      annual_amount: v.annualAmount || null,
      actual_annual_amount: v.actualAnnualAmount || null,
      booking_amount: v.securityBookingAmount || null,
      maintenance_charges: v.maintenanceCharges || null,
      rent: v.rent || null,
      security_deposit: v.securityDeposit || null,
      commission: v.commissionPercent || null,
      notice_period: v.noticePeriod || null,
      contract_amount: v.contractAmount || null,
      discount: v.discount || null,
      shell_and_core: !!v.shellAndCore,
      payment_count: v.paymentCount || null,
    };

    if (!existingId) {
      this.alertService.customSuccess('Invite Sent Successfully');
      onSuccess?.();
      return;
    }

    this.leaseService.updateLease({ ...payload, lease_id: existingId }).subscribe({
      next: () => {
        this.alertService.customSuccess('Lease saved successfully');
        onSuccess?.();
      },
      error: () => {
        this.alertService.customSuccess('Invite Sent Successfully');
        onSuccess?.();
      },
    });
  }

  resetFlow() {
    this.btnTitle.set('Send Negotiation');
    this.stepPhase.set('NEGOTIATION');
    this.showMsg.set(false);
    this.msgText.set('');
    this.showCheckSection.set(false);
  }
  stepRoutes: { [key: string]: string } = {
    '1-1': '/new-tenant/invite/property',
    '1-2': '/new-tenant/invite/commercial',
    '2-1': '/new-tenant/onboarding/profile',
    '2-2': '/new-tenant/onboarding/onboarding',
    '3-1': '/new-tenant/agreement',
    '4-1': '/new-tenant/ejari/doc',
    '4-2': '/new-tenant/ejari/signature',
  };
  goToStep(stepId: string, subStepId?: string) {
    const steps = this.PropertySteps()();

    // Find the main step index
    const stepIndex = steps.findIndex((s) => s.id === stepId);
    if (stepIndex === -1) return;

    this.activeIndex.set(stepIndex);

    const step = steps[stepIndex];

    // Sub-step handling safely
    let subIndex = 0;
    if (subStepId && step?.subSteps?.length) {
      const foundIndex = step.subSteps.findIndex(
        (sub) => sub?.id === subStepId,
      );
      subIndex = foundIndex !== -1 ? foundIndex : 0;
    }
    this.activeSubIndex.set(subIndex);

    // Router redirect only if subStepId exists in map
    const route = subStepId ? this.stepRoutes[subStepId] : null;
    if (route) {
      this.router.navigate([route]);
    }
  }
}
