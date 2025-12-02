import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StepEngine } from '../model/step-engine/step-engine';
import { LeaseService } from './lease.service';
import { StepSchema } from '../model/step-engine/step-schema';
import { SharedService } from '../../shared.service';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LeaseFormService {
  private formBuilder = inject(FormBuilder);
  private leaseService = inject(LeaseService);
  private sharedService = inject(SharedService);
  private readonly engine: WritableSignal<StepEngine | undefined> =
    signal(undefined);

  private getObjectToEpoch = this.sharedService.getObjectToEpoch;
  private getEpochToObject = this.sharedService.getEpochToObject;

  leasePropertyDetailsForm!: FormGroup;
  leaseCommercialDetailsForm!: FormGroup;
  leaseDocumentLayoutForm!: FormGroup;
  leaseNegotiationForm!: FormGroup;
  leaseDocumentsForm!: FormGroup;

  constructor() {
    this.initLeasePropertyDetailsForm();
    this.initLeaseCommercialDetailsForm();
    this.initLeaseDocumentLayoutForm();
    this.initLeaseNegotiationForm();
    this.initLeaseDocumentsForm();
  }

  setEngine(engine: StepEngine) {
    this.engine.set(engine);
  }

  initLeasePropertyDetailsForm() {
    this.leasePropertyDetailsForm = this.formBuilder.group({
      property: ['', [Validators.required]],
      tenant: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      graceStartDate: ['', [Validators.required]],
      graceEndDate: ['', [Validators.required]],
      remark: [''],
    });
  }

  initLeaseCommercialDetailsForm() {
    this.leaseCommercialDetailsForm = this.formBuilder.group({
      annualAmount: ['', [Validators.required]],
      actualAnnualAmount: ['', [Validators.required]],
      bookingAmount: ['', [Validators.required]],
      maintenanceCharges: ['', [Validators.required]],
      rent: ['', [Validators.required]],
      securityDeposite: ['', [Validators.required]],
      commission: ['', [Validators.required]],
      noticePeriod: ['', [Validators.required]],
      discount: [''],
    });
  }

  initLeaseDocumentLayoutForm() {
    this.leaseDocumentLayoutForm = this.formBuilder.group({
      documentLayout: ['createLayoutByAI', [Validators.required]],
      template: ['', [Validators.required]],
    });
  }

  initLeaseNegotiationForm() {
    this.leaseNegotiationForm = this.formBuilder.group({
      templateValues: ['', [Validators.required]],
    });
  }

  initLeaseDocumentsForm() {
    this.leaseDocumentsForm = this.formBuilder.group({
      documents: [[], [Validators.required]],
    });
  }

  buildLeaseSteps(): StepSchema[] {
    const steps: StepSchema[] = [
      {
        id: 'LEASE_DETAILS',
        title: 'Property Details',
        formGroup: this.leasePropertyDetailsForm,
        load: (context) => this.getLeasePropertyDetails(context),
        save: (payload, context) => this.savePropertyDetails(payload, context),
        mapIn: (response) => this.patchPropertyDetails(response),
        mapOut: (value) => this.mapOutPropertyDetails(value),
      },
      {
        id: 'LEASE_COMMERCIALS',
        title: 'Commercial Details',
        formGroup: this.leaseCommercialDetailsForm,
        load: (context) => this.getCommercialDetails(context),
        save: (payload, context) =>
          this.saveCommercialDetails(payload, context),
        mapIn: (response) => this.patchCommercialDetails(response),
        mapOut: (value) => this.mapOutCommercialDetails(value),
      },
      {
        id: 'DOCUMENTS_LAYOUT',
        title: 'Document Layout',
        formGroup: this.leaseDocumentLayoutForm,
      },
      {
        id: 'NEGOTIATION',
        title: 'Negotiation',
        formGroup: this.leaseNegotiationForm,
      },
      {
        id: 'UPLOAD_EJARI',
        title: 'Documents',
        formGroup: this.leaseDocumentLayoutForm,
      },
    ];

    return steps;
  }

  private applyStepStatus(stepChoice: string) {
    const steps = this.engine()
      ?.getSteps()
      ?.map((s) => s.id);
    if (!steps) return;

    const idx = steps.indexOf(stepChoice);

    steps.forEach((step, i) => {
      const status =
        i <= idx ? 'COMPLETED' : i === idx + 1 ? 'ONGOING' : 'LOCKED';
      const mode = i <= idx ? 'EDIT' : 'ADD';

      this.engine()?.setStepStatus(step, status);
      this.engine()?.setStepFormMode(step, mode);
    });
  }

  getLeasePropertyDetails(context: any) {
    return this.leaseService
      .getLeasePropertyDetails({
        lease_id: context.formId,
      })
      .pipe(tap((resp) => this.applyStepStatus(resp.content.step_choice)));
  }

  savePropertyDetails(payload: Record<string, any>, context: any) {
    const mode = this.engine()?.getCurrentStepFormMode();
    if (mode === 'EDIT') {
      payload['lease_id'] = context.formId;
      return this.leaseService.editLeasePropertyDetails(payload);
    } else {
      return this.leaseService.addLeasePropertyDetails(payload);
    }
  }

  patchPropertyDetails(response: any) {
    const content: any = response.content;
    return {
      property: content.lease_property,
      tenant: content.lease_tenant,
      startDate: this.getEpochToObject(content.lease_start_date),
      endDate: this.getEpochToObject(content.lease_end_date),
      graceStartDate: this.getEpochToObject(content.lease_grace_start_date),
      graceEndDate: this.getEpochToObject(content.lease_grace_end_date),
      remark: content.lease_remarks,
    };
  }

  mapOutPropertyDetails(value: any): Record<string, any> {
    const data: any = {
      lease_property_id: value?.property?.key,
      lease_tenant_id: value?.tenant?.key,
      lease_start_date: this.getObjectToEpoch(value.startDate),
      lease_end_date: this.getObjectToEpoch(value.endDate),
      lease_grace_start_date: this.getObjectToEpoch(value.graceStartDate),
      lease_grace_end_date: this.getObjectToEpoch(value.graceEndDate),
      lease_remarks: value?.remark,
    };

    return data;
  }

  getCommercialDetails(context: any) {
    return this.leaseService
      .getLeaseCommercialDetails({
        lease_id: context.formId,
      })
      .pipe(tap((resp) => this.applyStepStatus(resp.content.step_choice)));
  }

  saveCommercialDetails(payload: Record<string, any>, context: any) {
    const mode = this.engine()?.getCurrentStepFormMode();
    payload['lease_id'] = context.formId;
    if (mode === 'EDIT') {
      return this.leaseService.editLeaseCommercialDetails(payload);
    } else {
      return this.leaseService.addLeaseCommercialDetails(payload);
    }
  }

  patchCommercialDetails(response: any) {
    const content: any = response.content;

    return {
      annualAmount: content.annual_amount,
      actualAnnualAmount: content.actual_annual_amount,
      bookingAmount: content.booking_amount,
      maintenanceCharges: content.maintenance_charges,
      rent: content.rent,
      securityDeposite: content.security_deposit,
      commission: content.commission_percentage,
      noticePeriod: content,
      discount: content.discount,
    };
  }

  mapOutCommercialDetails(value: any): Record<string, any> {
    const data: any = {
      annual_amount: value.annualAmount,
      rent: value.rent,
      actual_annual_amount: value.actualAnnualAmount,
      booking_amount: value.bookingAmount,
      security_deposit: value.securityDeposite,
      maintenance_charges: value.maintenanceCharges,
      commission_percentage: value.commission,
      notice_period: value.noticePeriod,
      discount: value.discount,
    };

    return data;
  }
}
