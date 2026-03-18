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

              // Map _serialize_lease fields → createBasicForm leadData shape
              const leadData = {
                property_id:    lease.property_id,
                property_name:  lease.property_name,
                block_id:       lease.property_block_id,
                block_name:     lease.property_block_name,
                unit_id:        lease.unit_id,
                unit_name:      lease.unit_name,
                unit_size:      lease.unit_size,
                land_no:        lease.land_no,
                dm_no:          lease.dm_no,
                unit_usage:     lease.unit_usage,
                unit_type:      lease.unit_type,
                sub_type:       lease.sub_type,
                makani_no:      lease.makani_no,
                floor_no:       lease.floor_no,
                tenant_id:      lease.tenant_id,
                email:          lease.tenant_email,
                name:           lease.tenant_name,
                contact_number: lease.tenant_contact,
                unit_owners:    lease.unit_owners ?? [],
              };

              this.steps = this.newTenantService.PropertySteps(leadData);

              // Patch tenant personal / document fields not in createBasicForm mapping
              const basicFormGroup = this.steps()?.[0]?.subSteps?.[0]?.formGroup;
              if (basicFormGroup) {
                basicFormGroup.patchValue({
                  emiratesId:     lease.emirates_id      ?? '',
                  passportNo:     lease.passport_number  ?? '',
                  passportExpiry: lease.passport_expiry  ?? '',
                  visaNo:         lease.visa_number      ?? '',
                  visaExpiry:     lease.visa_expiry      ?? '',
                  addressLine1:   lease.address_line_1   ?? '',
                  addressLine2:   lease.address_line_2   ?? '',
                });
              }

              // Patch commercial form fields
              const commercialFormGroup = this.steps()?.[0]?.subSteps?.[1]?.formGroup;
              if (commercialFormGroup) {
                commercialFormGroup.patchValue({
                  startDate:             lease.start_date             ?? '',
                  endDate:               lease.end_date               ?? '',
                  graceStartDate:        lease.grace_start_date       ?? '',
                  graceEndDate:          lease.grace_end_date         ?? '',
                  annualAmount:          lease.annual_amount          ?? '',
                  actualAnnualAmount:    lease.actual_annual_amount   ?? '',
                  securityBookingAmount: lease.booking_amount         ?? '',
                  maintenanceCharges:    lease.maintenance_charges    ?? '',
                  rent:                  lease.rent                   ?? '',
                  securityDeposit:       lease.security_deposit       ?? '',
                  commissionPercent:     lease.commission             ?? '',
                  noticePeriod:          lease.notice_period          ?? '',
                  contractAmount:        lease.contract_amount        ?? '',
                  discount:              lease.discount               ?? '',
                  shellAndCore:          lease.shell_and_core         ?? false,
                  paymentCount:          lease.payment_count          ?? '',
                });
              }

              this.newTenantService.getActiveIndex().set(
                this.leaseStageToStepIndex(lease.lease_stage ?? stateLeaseStage),
              );
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
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
    }
  }

  private leaseStageToStepIndex(stage: string): number {
    switch (stage?.toUpperCase()) {
      case 'ONBOARDING': return 1;
      case 'AGREEMENT':  return 2;
      case 'EJARI':      return 3;
      case 'ACTIVATED':  return 4;
      default:           return 0;  // INVITE or unknown → start at step 0
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
