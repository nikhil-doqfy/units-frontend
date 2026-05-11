import { computed, Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';
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
import { LEASE_STAGE } from '../../../shared/constants/lease-stage.constants';

@Injectable({
  providedIn: 'root',
})
export class NewTenantFromService {
  private activeIndex = signal<number>(0);
  private activeSubIndex = signal<number>(0);
  private leaseId = signal<number | null>(null);
  private approvalId = signal<number | null>(null);

  getLeaseId() { return this.leaseId; }
  getApprovalId() { return this.approvalId; }

  // Commercial data from the selected unit — used to pre-fill the commercial form
  private unitCommercialData = signal<any>(null);
  getUnitCommercialData() {
    return this.unitCommercialData;
  }
  setUnitCommercialData(data: any) {
    this.unitCommercialData.set(data);
    this.prefillCommercialFromUnit(data);
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private leaseService: LeaseService,
    private alertService: AlertService,
  ) {}

  PropertySteps(leadData?: any) {
    return signal<NewTenant[]>([
      {
        id: '1',
        title: 'INVITE',
        subSteps: [
          {
            id: '1-1',
            title: 'PROPERTY_DETAILS',
            description: 'CREATE_LEASE_FIELDS',
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
            title: 'COMMERCIAL_DETAILS',
            description: 'CREATE_LEASE_FIELDS',
            component: CommercialdetailsComponent,
            formGroup: this.createCommercialForm(),
          },
        ],
      },
      {
        id: '2',
        title: 'ONBOARDING',
        subSteps: [
          {
            id: '2-1',
            title: 'WAITING_FOR_TENANT',
            description: 'INVITE_SENT',
            component: ProfileComponent,
            formGroup: this.createProfileForm(),
          },
          {
            id: '2-2',
            title: 'ONBOARDING',
            description: 'REVIEW_CHEQUES_AND_SEND_NEGOTIATION',
            component: OnboardingComponent,
            formGroup: this.createOnboardingForm(),
          },
        ],
      },
      {
        id: '3',
        title: 'AGREEMENT',
        subSteps: [
          {
            id: '3-1',
            title: 'PROFILE',
            component: AgreementComponent,
            formGroup: this.createBasicForm(),
            saveButtonDetails: {
              title: 'SEND_FOR_SIGNATURE',
              buttonType: 'SIMPLE',
              onClick: () => this.handleMainButtonClick(),
            },
          },
        ],
      },
      {
        id: '4',
        title: 'EJARI',
        subSteps: [
          {
            id: '4-1',
            title: 'PROFILE',
            component: EjariDocComponent,
            formGroup: this.createCommercialForm(),
            saveButtonDetails: {
              title: 'SEND_FOR_SIGNATURE',
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
        title: 'ACTIVATED',
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
      property: [
        leadData?.property_id
          ? { key: leadData.property_id, value: leadData.property_name }
          : '',
      ],
      block: [
        leadData?.block_id
          ? { key: leadData.block_id, value: leadData.block_name }
          : '',
      ],
      unit: [
        leadData?.unit_id
          ? { key: leadData.unit_id, value: leadData.unit_name }
          : '',
        Validators.required,
      ],
      unitName: [leadData?.unit_name ?? '', Validators.required],
      unitSize: [leadData?.unit_size ?? '', Validators.required],
      landNo: [leadData?.land_no ?? '', Validators.required],
      dmNo: [leadData?.dm_no ?? '', Validators.required],
      unitUsage: [leadData?.unit_usage ?? '', Validators.required],
      unitType: [leadData?.unit_type ?? '', Validators.required],
      subType: [leadData?.sub_type ?? '', Validators.required],
      makaniNo: [leadData?.makani_no ?? '', Validators.required],
      floorNo: [leadData?.floor_no ?? '', Validators.required],

      // Section 02 — Tenant
      tenantId: [leadData?.tenant_id ?? null],
      email: [leadData?.email ?? '', [Validators.required, Validators.email]],
      tenantName: [leadData?.name ?? '', Validators.required],
      nationality: [leadData?.nationality ?? '', Validators.required],
      passportNo: ['', Validators.required],
      passportExpiry: ['', Validators.required],
      emiratesId: ['', Validators.required],
      visaNo: ['', Validators.required],
      visaExpiry: ['', Validators.required],
      telNo: [leadData?.contact_number ?? '', Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: [''],

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
      ownerName: [o?.name ?? '', Validators.required],
      ownerEmail: [o?.email ?? '', [Validators.required, Validators.email]],
      ownerContact: [o?.contact_number ?? '', Validators.required],
      ownerEmiratesId: [o?.emirates_id ?? '', Validators.required],
      ownerNumber: [o?.owner_number ?? '', Validators.required],
      tradeLicenseNo: [o?.trade_license_number ?? '', Validators.required],
      licenseNumber: [o?.license_number ?? '', Validators.required],
      licenseExpiry: [
        o?.license_expiry_date
          ? String(o.license_expiry_date).slice(0, 10)
          : '',
        Validators.required,
      ],
      licenseIssuer: [o?.license_issuer ?? '', Validators.required],
      faxNo: [o?.fax_number ?? ''],
      poBox: [o?.po_box_number ?? ''],
    });
  }

  private _commercialForm: FormGroup | null = null;

  private createCommercialForm(): FormGroup {
    const form = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      graceStartDate: ['', Validators.required],
      graceEndDate: ['', Validators.required],
      annualAmount: ['', Validators.required],
      actualAnnualAmount: ['', Validators.required],
      securityBookingAmount: ['', Validators.required],
      maintenanceCharges: ['', Validators.required],
      rent: ['', Validators.required],
      securityDeposit: ['', Validators.required],
      commissionPercent: ['', Validators.required],
      noticePeriod: ['', Validators.required],
      contractAmount: ['', Validators.required],
      discount: [''],
      shellAndCore: [''],
      paymentCount: ['', Validators.required],
    });
    this._commercialForm = form;
    return form;
  }

  /** Patch the commercial form with unit defaults (blank fields only). */
  prefillCommercialFromUnit(u: any) {
    const form = this._commercialForm;
    if (!form || !u) return;

    const blank = (ctrl: string) => !form.get(ctrl)?.value;
    const patch: Record<string, any> = {};

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
      form.patchValue(patch, { emitEvent: false });
    }
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
  private showChequeWaiting = signal(false);
  isSendingInvite = signal(false);
  isSendingNegotiation = signal(false);
  private approvalStage = signal<
    'NEGOTIATION_SENT' | 'OWNER_APPROVED' | 'TENANT_APPROVED' | null
  >(null);
  private chequeConfirmed = signal(false);

  getShowCheckSection() {
    return this.showCheckSection;
  }
  getShowChequeWaiting() {
    return this.showChequeWaiting;
  }
  getApprovalStage() {
    return this.approvalStage;
  }
  getChequeConfirmed() {
    return this.chequeConfirmed;
  }
  private showMsg = signal(false);
  private msgText = signal('');
  private btnTitle = signal<
    | 'Send Negotiation'
    | 'Cheque Request'
    | 'Verify Cheque'
    | 'Save & Next'
    | 'Send for Signature'
    | 'Submit for Ejari'
    | 'Approval & Generate Invoice'
    | 'Proceed to Agreement'
  >('Send Negotiation');
  currentLeaseStage = signal<string>('');
  private showRefresh = signal(false);
  showRefresh$ = computed(() => this.showRefresh());
  private stepPhase = signal<'NEGOTIATION' | 'CHEQUE' | 'COLLECTED' | 'VERIFIED' | 'FINAL'>(
    'NEGOTIATION',
  );
  private agreementPhase = signal<'INIT' | 'SIGNING' | 'SIGNED'>('INIT');
  private ejariPhase = signal<'INIT' | 'SIGNING' | 'SIGNED'>('INIT');
  private agreementPdfUrl = signal<string | null>(null);

  getAgreementPdfUrl() {
    return this.agreementPdfUrl;
  }
  setAgreementPdfUrl(url: string | null) {
    this.agreementPdfUrl.set(url);
  }
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
    } else if (this.stepPhase() === 'COLLECTED') {
      this.triggerProceedToAgreement();
    }
  }

  private triggerProceedToAgreement() {
    this.updateLeaseStage('AGREEMENT');
    this.showCheckSection.set(false);
    this.activeIndex.set(2);
    this.activeSubIndex.set(0);
    this.startAgreementFlow();
  }

  private triggerNegotiation() {
    if (this.isSendingNegotiation()) return;
    const id = this.leaseId();
    if (!id) {
      this.alertService.error(
        'Lease not found. Please complete the previous steps first.',
      );
      return;
    }
    this.isSendingNegotiation.set(true);
    this.msgText.set('Sending negotiation document…');
    this.showMsg.set(true);

    this.leaseService.sendNegotiation(id).subscribe({
      next: () => {
        this.isSendingNegotiation.set(false);
        this.msgText.set(
          'Negotiation sent  |  Waiting for approval from Owner and Tenant…',
        );
        this.btnTitle.set('Cheque Request');
        this.stepPhase.set('CHEQUE');
      },
      error: () => {
        this.isSendingNegotiation.set(false);
        this.msgText.set('Failed to send negotiation. Please try again.');
        setTimeout(() => this.showMsg.set(false), 3000);
      },
    });
  }

  private triggerChequeRequest() {
    this.updateLeaseStage('CHEQUE_REQUESTED');
    this.showChequeWaiting.set(true);
    this.stepPhase.set('CHEQUE');
    this.msgText.set(
      'A cheque request has been sent to the tenant. This page will update once the tenant uploads their cheque documents.',
    );
    this.showMsg.set(true);
  }

  startAgreementFlow() {
    const s = this.currentLeaseStage()?.toUpperCase();
    // If restoreStepFromStage already handled a known stage, don't overwrite it
    if (s === LEASE_STAGE.AGREEMENT_SIGNING || s === LEASE_STAGE.AGREEMENT_SIGNED) return;
    this.btnTitle.set('Send for Signature');
    this.agreementPhase.set('INIT');
    this.showMsg.set(false);
    this.msgText.set('');
  }

  triggerAgreementSignature(goNext: () => void) {
    if (this.agreementPhase() === 'INIT') {
      const id = this.leaseId();
      if (!id) {
        this.alertService.error(
          'Lease not found. Please complete the previous steps first.',
        );
        return;
      }
      this.msgText.set('Sending signature requests…');
      this.showMsg.set(true);

      this.leaseService.sendForSignature(id).subscribe({
        next: () => {
          this.updateLeaseStage('AGREEMENT_SIGNING');
          this.msgText.set('Signature requests sent. Waiting for signatures…');
          this.btnTitle.set('Submit for Ejari');
          this.agreementPhase.set('SIGNING');
        },
        error: () => {
          this.msgText.set(
            'Failed to send signature requests. Please try again.',
          );
          setTimeout(() => this.showMsg.set(false), 3000);
        },
      });
    } else if (this.agreementPhase() === 'SIGNED') {
      goNext();
    }
  }

  triggerEjariSignature(goNext?: () => void) {
    if (this.ejariPhase() === 'INIT') {
      const id = this.leaseId();
      if (!id) return;

      this.msgText.set('Sending Ejari for signature…');
      this.showMsg.set(true);

      this.leaseService.sendEjariForSignature(id).subscribe({
        next: () => {
          this.updateLeaseStage(LEASE_STAGE.EJARI_SIGNING);
          this.msgText.set('Ejari sent for signature. Waiting for tenant to sign…');
          this.btnTitle.set('Approval & Generate Invoice');
          this.ejariPhase.set('SIGNING');
        },
        error: () => {
          this.msgText.set('Failed to send Ejari for signature. Please try again.');
          setTimeout(() => this.showMsg.set(false), 3000);
        },
      });
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
  private isSavingBasic = false;

  saveBasicStep(basicForm: FormGroup, onSuccess?: () => void) {
    if (this.isSavingBasic) return;
    this.isSavingBasic = true;

    const v = basicForm.value;
    const unitId = v.unit?.key ?? v.unit ?? null;

    if (!unitId) {
      this.isSavingBasic = false;
      onSuccess?.();
      return;
    }

    const payload: Record<string, any> = {
      unit_id: unitId,
      tenant_id: v.tenantId ?? null,
      email: v.email ?? '',
      tenant_name: v.tenantName ?? '',
      contact_number: v.telNo ?? '',
      emirates_id: v.emiratesId ?? '',
      nationality: v.nationality ?? '',
      passport_number: v.passportNo ?? '',
      passport_expiry_date: v.passportExpiry ?? '',
      visa_number: v.visaNo ?? '',
      visa_expiry_date: v.visaExpiry ?? '',
      address_line_1: v.addressLine1 ?? '',
      address_line_2: v.addressLine2 ?? '',
      platform: v.platform ?? '',
    };

    const existingId = this.leaseId();

    if (existingId) {
      this.leaseService
        .updateLease({
          ...payload,
          lease_id: existingId,
          lease_stage: LEASE_STAGE.COMMERCIAL_DETAILS,
        })
        .subscribe({
          next: () => {
            this.isSavingBasic = false;
            this.alertService.success('Lease saved successfully');
            onSuccess?.();
          },
          error: () => {
            this.isSavingBasic = false;
            this.alertService.error('Failed to save lease. Please try again.');
          },
        });
      return;
    }

    // leaseId not in memory — check for an existing draft lease for this unit
    // to avoid creating duplicates when the user navigates away and returns.
    this.leaseService.getLeases({ unit_id: unitId, page_size: 1 }).subscribe({
      next: (resp: any) => {
        const existingLease = resp?.content?.[0] ?? null;
        const stage = existingLease?.lease_stage?.toUpperCase();
        const isDraft =
          stage === LEASE_STAGE.BASIC_DETAILS || stage === LEASE_STAGE.COMMERCIAL_DETAILS;

        if (isDraft) {
          this.leaseId.set(existingLease.id);
          this.leaseService
            .updateLease({
              ...payload,
              lease_id: existingLease.id,
              lease_stage: LEASE_STAGE.COMMERCIAL_DETAILS,
            })
            .subscribe({
              next: () => {
                this.isSavingBasic = false;
                this.alertService.success('Lease saved successfully');
                onSuccess?.();
              },
              error: () => {
                this.isSavingBasic = false;
                this.alertService.error(
                  'Failed to save lease. Please try again.',
                );
              },
            });
        } else {
          this.leaseService
            .createLease({ ...payload, lease_stage: LEASE_STAGE.COMMERCIAL_DETAILS })
            .subscribe({
              next: (createResp: any) => {
                if (createResp?.content?.id)
                  this.leaseId.set(createResp.content.id);
                this.isSavingBasic = false;
                this.alertService.success('Lease saved successfully');
                onSuccess?.();
              },
              error: () => {
                this.isSavingBasic = false;
                this.alertService.error(
                  'Failed to save lease. Please try again.',
                );
              },
            });
        }
      },
      error: () => {
        // Lookup failed — fall back to create
        this.leaseService
          .createLease({ ...payload, lease_stage: LEASE_STAGE.COMMERCIAL_DETAILS })
          .subscribe({
            next: (createResp: any) => {
              if (createResp?.content?.id)
                this.leaseId.set(createResp.content.id);
              this.isSavingBasic = false;
              this.alertService.success('Lease saved successfully');
              onSuccess?.();
            },
            error: () => {
              this.isSavingBasic = false;
              this.alertService.error(
                'Failed to save lease. Please try again.',
              );
            },
          });
      },
    });
  }

  /** Save commercial data only (no invite sent) — used before creating manager approval. */
  saveCommercialData(commercialForm: FormGroup, onSuccess?: () => void) {
    const v = commercialForm.value;
    const existingId = this.leaseId();
    if (!existingId) { onSuccess?.(); return; }

    const payload: Record<string, any> = {
      lease_id: existingId,
      lease_stage: LEASE_STAGE.COMMERCIAL_DETAILS,
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

    this.leaseService.updateLease(payload).subscribe({
      next: () => onSuccess?.(),
      error: () => onSuccess?.(),
    });
  }

  sendManagerApproval(
    leaseId: number,
    requestedRent: number,
    requestedTenure: string,
    onSuccess?: () => void,
  ) {
    this.leaseService
      .sendManagerApproval({ lease_id: leaseId, requested_rent: requestedRent, requested_tenure: requestedTenure })
      .subscribe({
        next: (res: any) => {
          this.approvalId.set(res?.content?.approval_id ?? null);
          this.currentLeaseStage.set('MANAGER_APPROVAL_REQUIRED');
          this.msgText.set('Waiting for Manager Approval — a manager must approve the lease terms before you can proceed.');
          this.showMsg.set(true);
          this.alertService.success('Approval request sent to manager');
          onSuccess?.();
        },
        error: () => {
          this.alertService.error('Failed to send approval request. Please try again.');
          onSuccess?.();
        },
      });
  }

  saveCommercialStep(commercialForm: FormGroup, onSuccess?: () => void) {
    if (this.isSendingInvite()) return;
    this.isSendingInvite.set(true);

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
      this.isSendingInvite.set(false);
      this.alertService.success('Invite Sent Successfully');
      onSuccess?.();
      return;
    }

    this.leaseService
      .updateLease({
        ...payload,
        lease_id: existingId,
        lease_stage: LEASE_STAGE.WAITING_FOR_SIGNUP,
      })
      .subscribe({
        next: () => {
          this.currentLeaseStage.set(LEASE_STAGE.WAITING_FOR_SIGNUP);
          this.showMsg.set(false);
          this.msgText.set('');
          this.leaseService.sendLeaseInvite(existingId).subscribe({
            next: () => {
              this.isSendingInvite.set(false);
              this.alertService.success('Invite sent successfully to tenant');
            },
            error: () => {
              this.isSendingInvite.set(false);
              this.alertService.error('Lease saved but failed to send invite email');
            },
          });
          onSuccess?.();
        },
        error: () => {
          this.isSendingInvite.set(false);
          this.alertService.success('Invite Sent Successfully');
          onSuccess?.();
        },
      });
  }

  /** Called by FormRenderComponent when the user advances to a new main step. */
  updateLeaseStage(stage: string) {
    const id = this.leaseId();
    if (!id) return;
    this.leaseService
      .updateLease({ lease_id: id, lease_stage: stage })
      .subscribe();
  }

  resetFlow() {
    this.btnTitle.set('Send Negotiation');
    this.stepPhase.set('NEGOTIATION');
    this.showMsg.set(false);
    this.msgText.set('');
    this.showCheckSection.set(false);
    this.chequeConfirmed.set(false);
  }

  /** Restores button state when loading an existing lease with a known stage. */
  restoreStepFromStage(stage: string): void {
    this.currentLeaseStage.set(stage ?? '');
    const s = stage?.toUpperCase();

    // Commercial details flagged for manager approval
    if (s === LEASE_STAGE.MANAGER_APPROVAL_REQUIRED) {
      this.msgText.set('Waiting for Manager Approval — a manager must approve the lease terms before you can proceed.');
      this.showMsg.set(true);
      return;
    }

    // Manager has approved — allow user to proceed with sending invite
    if (s === LEASE_STAGE.MANAGER_APPROVED) {
      this.msgText.set('Manager approved your lease terms. You can now send the invite.');
      this.showMsg.set(true);
      return;
    }

    // Invite sent — waiting for tenant to sign up (ProfileComponent shown as sub-step 0)
    if (s === LEASE_STAGE.WAITING_FOR_SIGNUP || s === LEASE_STAGE.ONBOARDING) {
      // No special button state needed; default is fine.
      // Navigation to step 1, sub-step 0 is handled by leaseStageToStepIndex in new-tenant.component.
      return;
    }

    // Negotiation sent — waiting for both approvals
    if (s === LEASE_STAGE.NEGOTIATION_SENT || s === LEASE_STAGE.PENDING_APPROVAL) {
      this.msgText.set(
        'Negotiation sent  |  Waiting for approval from Owner and Tenant…',
      );
      this.showMsg.set(true);
      this.btnTitle.set('Cheque Request');
      this.stepPhase.set('CHEQUE');

      // Owner approved — still waiting for tenant
    } else if (s === LEASE_STAGE.OWNER_APPROVED) {
      this.msgText.set('Owner has approved ✓  |  Waiting for Tenant approval…');
      this.showMsg.set(true);
      this.btnTitle.set('Cheque Request');
      this.stepPhase.set('CHEQUE');

      // Tenant approved — still waiting for owner
    } else if (s === LEASE_STAGE.TENANT_APPROVED) {
      this.msgText.set('Tenant has approved ✓  |  Waiting for Owner approval…');
      this.showMsg.set(true);
      this.btnTitle.set('Cheque Request');
      this.stepPhase.set('CHEQUE');

      // Both approved — admin yet to click Cheque Request → show Cheque Request button
    } else if (s === LEASE_STAGE.WAITING_CHEQUE) {
      this.btnTitle.set('Cheque Request');
      this.stepPhase.set('CHEQUE');

      // Admin clicked Cheque Request → show waiting screen
    } else if (s === LEASE_STAGE.CHEQUE_REQUESTED) {
      this.msgText.set(
        'A cheque request has been sent to the tenant. This page will update once the tenant uploads their cheque documents.',
      );
      this.showMsg.set(true);
      this.btnTitle.set('Cheque Request');
      this.stepPhase.set('CHEQUE');

      // Cheque collected — show rent cheques section, awaiting PM verification
    } else if (s === LEASE_STAGE.CHEQUE_COLLECTED) {
      this.showCheckSection.set(true);
      this.btnTitle.set('Verify Cheque');
      this.stepPhase.set('COLLECTED');

      // PM verified cheque documents — ready to proceed to Agreement
    } else if (s === LEASE_STAGE.CHEQUE_VERIFIED) {
      this.showCheckSection.set(true);
      this.msgText.set('Cheque documents verified ✓  You can now proceed to the Agreement step.');
      this.showMsg.set(true);
      this.btnTitle.set('Proceed to Agreement');
      this.stepPhase.set('VERIFIED');

      // Agreement stage — show Send for Signature button
    } else if (s === LEASE_STAGE.AGREEMENT) {
      this.btnTitle.set('Send for Signature');
      this.agreementPhase.set('INIT');

      // Agreement sent for signature
    } else if (s === LEASE_STAGE.AGREEMENT_SIGNING) {
      this.btnTitle.set('Submit for Ejari');
      this.agreementPhase.set('SIGNING');
      this.msgText.set('Waiting for Signature');
      this.showMsg.set(true);

      // Agreement signed, ready to proceed to Ejari
    } else if (s === LEASE_STAGE.AGREEMENT_SIGNED) {
      this.btnTitle.set('Submit for Ejari');
      this.agreementPhase.set('SIGNED');

      // Ejari sent for signature — waiting for tenant to sign
    } else if (s === LEASE_STAGE.EJARI_SIGNING) {
      this.btnTitle.set('Approval & Generate Invoice');
      this.ejariPhase.set('SIGNING');
      this.msgText.set('Ejari sent for signature. Waiting for tenant to sign…');
      this.showMsg.set(true);

      // Ejari document uploaded — ready to send for signature
    } else if (s === LEASE_STAGE.EJARI_DOCUMENT_UPLOAD || s === LEASE_STAGE.EJARI) {
      this.btnTitle.set('Send for Signature');
      this.ejariPhase.set('INIT');
    }
  }

  getCurrentLeaseStage(): string {
    return this.currentLeaseStage();
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
