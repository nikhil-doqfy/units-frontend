import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SharedService } from '../../../shared.service';
import { BreadCrumb } from '../../../shared/model/shared.model';
import { FormRenderComponent } from '../../../newtenant/component/form-render/form-render.component';
import { NewTenantFromService } from '../../../newtenant/component/service/new-tenant-from.service';
import { LeadsService } from '../../services/leads.service';
import { LeaseService } from '../../services/lease.service';
import { LEASE_STAGE } from '../../../shared/constants/lease-stage.constants';

@Component({
  selector: 'app-new-tenant',
  standalone: true,
  imports: [CommonModule, FormRenderComponent],
  templateUrl: './new-tenant.component.html',
  styleUrl: './new-tenant.component.css',
})
export class NewTenantComponent {
  private destroyRef       = inject(DestroyRef);
  private translate        = inject(TranslateService);
  private newTenantService = inject(NewTenantFromService);
  private sharedService    = inject(SharedService);
  private leadsService     = inject(LeadsService);
  private leaseService     = inject(LeaseService);
  private route            = inject(ActivatedRoute);

  steps       = this.newTenantService.PropertySteps(null);
  activeIndex = this.newTenantService.getActiveIndex();
  loading     = signal(false);
  breadcrumbData: BreadCrumb[] = [];

  constructor() {}

  ngOnInit() {
    this.loadBreadcrumb();
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadBreadcrumb());

    // Reset singleton state for a fresh visit
    this.newTenantService.getLeaseId().set(null);
    this.newTenantService.getActiveIndex().set(0);
    this.newTenantService.getActiveSubIndex().set(0);

    // ── Case 1: coming from tenants list "Continue" action ────────────
    const stateLeaseId    = history.state?.leaseId;
    const stateLeaseStage = history.state?.leaseStage;

    if (stateLeaseId != null) {
      this.loading.set(true);
      this.leaseService
        .getLeaseById(stateLeaseId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resp: any) => {
            const lease = resp ?? null;
            if (lease) {
              this.newTenantService.getLeaseId().set(lease.id);

              const p = lease.property ?? {};
              const u = lease.unit     ?? {};
              const t = lease.tenant   ?? {};
              const d = lease.dates    ?? {};
              const f = lease.financials ?? {};

              const leadData = {
                property_id:    p.id,
                property_name:  p.name,
                block_id:       p.block_id,
                block_name:     p.block_name,
                unit_id:        u.id,
                unit_name:      u.name,
                unit_size:      u.size,
                land_no:        u.land_no,
                dm_no:          u.dm_no,
                unit_usage:     u.unit_usage,
                unit_type:      u.unit_type,
                sub_type:       u.sub_type,
                makani_no:      u.makani_no,
                floor_no:       u.floor_no,
                tenant_id:      t.id,
                email:          t.email,
                name:           t.name,
                contact_number: t.contact,
                unit_owners:    u.owners ?? [],
                platform:       lease.platform ?? '',
              };

              this.steps = this.newTenantService.PropertySteps(leadData);

              // Pre-fill commercial form with unit defaults (blank fields only)
              this.newTenantService.setUnitCommercialData(u);

              const basicFormGroup = this.steps()?.[0]?.subSteps?.[0]?.formGroup;
              if (basicFormGroup) {
                basicFormGroup.patchValue({
                  nationality:    t.nationality      ?? '',
                  emiratesId:     t.emirates_id      ?? '',
                  passportNo:     t.passport_number  ?? '',
                  passportExpiry: t.passport_expiry  ?? '',
                  visaNo:         t.visa_number      ?? '',
                  visaExpiry:     t.visa_expiry      ?? '',
                  addressLine1:   t.address_line_1   ?? '',
                  addressLine2:   t.address_line_2   ?? '',
                });
              }

              const commercialFormGroup = this.steps()?.[1]?.subSteps?.[0]?.formGroup;
              if (commercialFormGroup) {
                commercialFormGroup.patchValue({
                  startDate:             d.start_date             ?? '',
                  endDate:               d.end_date               ?? '',
                  graceStartDate:        d.grace_start_date       ?? '',
                  graceEndDate:          d.grace_end_date         ?? '',
                  annualAmount:          f.annual_amount          ?? '',
                  actualAnnualAmount:    f.actual_annual_amount   ?? '',
                  securityBookingAmount: f.booking_amount         ?? '',
                  maintenanceCharges:    f.maintenance_charges    ?? '',
                  rent:                  f.rent                   ?? '',
                  securityDeposit:       f.security_deposit       ?? '',
                  commissionPercent:     f.commission             ?? '',
                  noticePeriod:          f.notice_period          ?? '',
                  contractAmount:        f.contract_amount        ?? '',
                  discount:              f.discount               ?? '',
                  shellAndCore:          lease.shell_and_core     ?? false,
                  paymentCount:          f.payment_count          ?? '',
                });
              }

              const stage = lease.lease_stage ?? stateLeaseStage;

              // Property Details, Commercial Details, Ejari, Signature and
              // Activated are all standalone top-level steps, each with
              // exactly one sub-step.
              this.newTenantService.getActiveIndex().set(
                this.leaseStageToStepIndex(stage),
              );
              this.newTenantService.getActiveSubIndex().set(0);
              this.newTenantService.restoreStepFromStage(stage);
            }
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      return;
    }

    // ── Case 2: coming from leads list with lead_id ────────────────────
    const leadId =
      this.route.snapshot.queryParamMap.get('lead_id') ??
      history.state?.leadData?.id ??
      null;

    if (leadId) {
      this.loading.set(true);
      this.leadsService
        .getLeadById(leadId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resp: any) => {
            const leadData = resp ?? null;
            this.steps = this.newTenantService.PropertySteps(leadData);

            const leaseId = leadData?.lease_id ?? null;
            const stage   = (leadData?.lease_stage ?? '') as string;

            if (!leaseId) {
              // No lease created yet — prefill Amount/Rent Details from the
              // lead's latest sent proposal (falling back to the unit's own
              // rent) so the PM doesn't have to re-enter numbers already
              // agreed with the customer. Lessor Period is left blank: a
              // proposal only tracks its hold window, not an actual lease
              // term.
              const latestProposal = leadData?.proposals?.[0] ?? null;
              if (latestProposal || leadData?.rent) {
                this.newTenantService.setUnitCommercialData({
                  rent: latestProposal?.offered_rent ?? leadData?.rent,
                  maintenance_charges: latestProposal?.offered_maintenance_charges,
                  booking_amount: latestProposal?.holding_amount,
                });
              }
              this.loading.set(false);
              return;
            }

            this.newTenantService.getLeaseId().set(leaseId);
            this.newTenantService.restoreStepFromStage(stage);

            // Property Details, Commercial Details, Ejari, Signature and
            // Activated are all standalone top-level steps, each with
            // exactly one sub-step.
            this.newTenantService.getActiveIndex().set(this.leaseStageToStepIndex(stage));
            this.newTenantService.getActiveSubIndex().set(0);

            // Fetch full lease details to pre-fill forms
            this.leaseService
              .getLeaseById(leaseId)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (detailResp: any) => {
                  const fullLease = detailResp ?? null;
                  if (fullLease) {
                    const u = fullLease.unit      ?? {};
                    const t = fullLease.tenant    ?? {};
                    const d = fullLease.dates     ?? {};
                    const f = fullLease.financials ?? {};

                    this.newTenantService.setUnitCommercialData(u);

                    const basicFormGroup = this.steps()?.[0]?.subSteps?.[0]?.formGroup;
                    if (basicFormGroup) {
                      basicFormGroup.patchValue({
                        nationality:    t.nationality      ?? '',
                        emiratesId:     t.emirates_id      ?? '',
                        passportNo:     t.passport_number  ?? '',
                        passportExpiry: t.passport_expiry  ?? '',
                        visaNo:         t.visa_number      ?? '',
                        visaExpiry:     t.visa_expiry      ?? '',
                        addressLine1:   t.address_line_1   ?? '',
                        addressLine2:   t.address_line_2   ?? '',
                      });
                    }

                    const commercialFormGroup = this.steps()?.[1]?.subSteps?.[0]?.formGroup;
                    if (commercialFormGroup) {
                      commercialFormGroup.patchValue({
                        startDate:             d.start_date             ?? '',
                        endDate:               d.end_date               ?? '',
                        graceStartDate:        d.grace_start_date       ?? '',
                        graceEndDate:          d.grace_end_date         ?? '',
                        annualAmount:          f.annual_amount          ?? '',
                        actualAnnualAmount:    f.actual_annual_amount   ?? '',
                        securityBookingAmount: f.booking_amount         ?? '',
                        maintenanceCharges:    f.maintenance_charges    ?? '',
                        rent:                  f.rent                   ?? '',
                        securityDeposit:       f.security_deposit       ?? '',
                        commissionPercent:     f.commission             ?? '',
                        noticePeriod:          f.notice_period          ?? '',
                        contractAmount:        f.contract_amount        ?? '',
                        discount:              f.discount               ?? '',
                        shellAndCore:          fullLease.shell_and_core ?? false,
                        paymentCount:          f.payment_count          ?? '',
                      });
                    }
                  }
                  this.loading.set(false);
                },
                error: () => this.loading.set(false),
              });
          },
          error: () => this.loading.set(false),
        });
    }
  }

  private leaseStageToStepIndex(stage: string): number {
    switch (stage?.toUpperCase()) {
      case LEASE_STAGE.COMMERCIAL_DETAILS:
      case LEASE_STAGE.MANAGER_APPROVAL_REQUIRED:
      case LEASE_STAGE.MANAGER_APPROVED:
        return 1;
      // Onboarding + Agreement steps were removed -- any lease sitting at
      // one of these legacy stages, plus the real cheque-collection
      // stages, now opens on the Collect Cheque step.
      case LEASE_STAGE.WAITING_FOR_SIGNUP:
      case LEASE_STAGE.ONBOARDING:
      case LEASE_STAGE.NEGOTIATION_SENT:
      case LEASE_STAGE.PENDING_APPROVAL:
      case LEASE_STAGE.OWNER_APPROVED:
      case LEASE_STAGE.TENANT_APPROVED:
      case LEASE_STAGE.WAITING_CHEQUE:
      case LEASE_STAGE.CHEQUE_REQUESTED:
      case LEASE_STAGE.CHEQUE_COLLECTED:
      case LEASE_STAGE.CHEQUE_VERIFIED:
      case LEASE_STAGE.AGREEMENT:
      case LEASE_STAGE.AGREEMENT_SIGNING:
      case LEASE_STAGE.AGREEMENT_SIGNED:
        return 2;
      case LEASE_STAGE.EJARI:
      case LEASE_STAGE.EJARI_DOCUMENT_UPLOAD:
      case LEASE_STAGE.EJARI_APPROVED:
        return 3;
      // Signature is its own top-level step, separate from the Ejari
      // document step -- signing here is a UAE PASS authentication, not
      // an Ejari certificate signature.
      case LEASE_STAGE.EJARI_SIGNING:
      case LEASE_STAGE.EJARI_SIGNED:
        return 4;
      case LEASE_STAGE.ACTIVATED:
        return 5;
      default:
        return 0;
    }
  }

  loadBreadcrumb() {
    this.setBreadCrumb([
      { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
      { label: 'PAGE_TITLE.NEW_TENANT', link: '' },
    ]);
  }

  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }
}
