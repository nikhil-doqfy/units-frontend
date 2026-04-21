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
            const lease = resp?.content ?? null;
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

              const commercialFormGroup = this.steps()?.[0]?.subSteps?.[1]?.formGroup;
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
              const s = stage?.toUpperCase();

              const isAgreementOrLater =
                s === 'AGREEMENT'        || s === 'AGREEMENT_SIGNING' ||
                s === 'AGREEMENT_SIGNED' || s === 'EJARI'             ||
                s === 'EJARI_SIGNING'    || s === 'ACTIVATED';

              if (s === 'WAITING_FOR_SIGNUP') {
                // Always show the "Waiting for Tenant" page (sub-step 0)
                // regardless of is_onboarding flag
                this.newTenantService.getActiveIndex().set(1);
                this.newTenantService.getActiveSubIndex().set(0);
              } else if (s === 'COMMERCIAL_DETAILS') {
                // Property details saved — resume on Commercial Details (step 1-2)
                this.newTenantService.getActiveIndex().set(0);
                this.newTenantService.getActiveSubIndex().set(1);
              } else if (!isAgreementOrLater && (
                  t.is_onboarding          ||
                  s === 'ONBOARDING'       ||
                  s === 'NEGOTIATION_SENT' || s === 'PENDING_APPROVAL' ||
                  s === 'OWNER_APPROVED'   || s === 'TENANT_APPROVED'  ||
                  s === 'WAITING_CHEQUE'   || s === 'CHEQUE_REQUESTED' ||
                  s === 'CHEQUE_COLLECTED')) {
                this.newTenantService.getActiveIndex().set(1);
                this.newTenantService.getActiveSubIndex().set(1);
              } else {
                this.newTenantService.getActiveIndex().set(
                  this.leaseStageToStepIndex(stage),
                );
                this.newTenantService.getActiveSubIndex().set(0);
              }
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
            const leadData = resp?.content ?? null;
            this.steps = this.newTenantService.PropertySteps(leadData);

            if (leadData?.unit_id) {
              this.leaseService
                .getLeases({ unit_id: leadData.unit_id, page_size: 1 })
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                  next: (leaseResp: any) => {
                    const lease = leaseResp?.content?.[0] ?? null;
                    if (!lease) {
                      this.loading.set(false);
                      return;
                    }

                    this.newTenantService.getLeaseId().set(lease.id);
                    const stage = lease.lease_stage ?? '';
                    this.newTenantService.restoreStepFromStage(stage);
                    if (stage === 'COMMERCIAL_DETAILS') {
                      this.newTenantService.getActiveIndex().set(0);
                      this.newTenantService.getActiveSubIndex().set(1);
                    } else if (stage && stage !== 'BASIC_DETAILS') {
                      this.newTenantService.getActiveIndex().set(this.leaseStageToStepIndex(stage));
                      this.newTenantService.getActiveSubIndex().set(0);
                    }

                    // Fetch full lease details to pre-fill forms (needed on page refresh)
                    this.leaseService
                      .getLeaseById(lease.id)
                      .pipe(takeUntilDestroyed(this.destroyRef))
                      .subscribe({
                        next: (detailResp: any) => {
                          const fullLease = detailResp?.content ?? null;
                          if (fullLease) {
                            const u = fullLease.unit     ?? {};
                            const t = fullLease.tenant   ?? {};
                            const d = fullLease.dates    ?? {};
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

                            const commercialFormGroup = this.steps()?.[0]?.subSteps?.[1]?.formGroup;
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
            } else {
              this.loading.set(false);
            }
          },
          error: () => this.loading.set(false),
        });
    }
  }

  private leaseStageToStepIndex(stage: string): number {
    switch (stage?.toUpperCase()) {
      case 'WAITING_FOR_SIGNUP': // invite sent, waiting for tenant to register
      case 'ONBOARDING':
        return 1; // → Onboarding step, sub-step 0 (waiting page)
      case 'NEGOTIATION_SENT':
      case 'PENDING_APPROVAL':
      case 'OWNER_APPROVED':
      case 'TENANT_APPROVED':
      case 'WAITING_CHEQUE':
      case 'CHEQUE_REQUESTED':
      case 'CHEQUE_COLLECTED':
        return 1;
      case 'AGREEMENT':
      case 'AGREEMENT_SIGNING':
      case 'AGREEMENT_SIGNED':
        return 2;
      case 'EJARI':
      case 'EJARI_SIGNING':
      case 'ACTIVATED':
        return 3;
      default:
        return 0; // INVITE or unknown
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
