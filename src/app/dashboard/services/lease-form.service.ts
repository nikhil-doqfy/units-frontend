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

  propertyDetailsForm!: FormGroup;
  tenantDetailsForm!: FormGroup;
  leaseDetailsForm!: FormGroup;
  paymentDetailsForm!: FormGroup;
  // leaseDocumentLayoutForm!: FormGroup;
  // leaseNegotiationForm!: FormGroup;
  leaseDocumentsForm!: FormGroup;

  constructor() {
    this.initPropertyDetailForm();
    this.initTenantDetailsForm();
    this.initLeaseDetailsForm();
    // this.initLeaseDocumentLayoutForm();
    // this.initLeaseNegotiationForm();
    this.initLeaseDocumentsForm();
  }

  setEngine(engine: StepEngine) {
    this.engine.set(engine);
  }

  initPropertyDetailForm() {
    this.propertyDetailsForm = this.formBuilder.group({
      property: ['', [Validators.required]],
      block: ['', [Validators.required]],
      unit: ['', [Validators.required]],
    });
  }

  initTenantDetailsForm() {
    this.tenantDetailsForm = this.formBuilder.group({
      tenant: ['', [Validators.required]],
    });
  }

  initLeaseDetailsForm() {
    this.leaseDetailsForm = this.formBuilder.group({
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      graceStartDate: ['', [Validators.required]],
      graceEndDate: ['', [Validators.required]],
      annualAmount: ['', [Validators.required]],
      actualAnnualAmount: ['', [Validators.required]],
      bookingAmount: ['', [Validators.required]],
      maintenanceCharges: ['', [Validators.required]],
      rent: ['', [Validators.required]],
      securityDeposite: ['', [Validators.required]],
      commission: ['', [Validators.required]],
      noticePeriod: ['', [Validators.required]],
      discount: [''],
      remark: [''],
    });
  }

  // initLeaseDocumentLayoutForm() {
  //   this.leaseDocumentLayoutForm = this.formBuilder.group({
  //     documentLayout: ['createLayoutByAI', [Validators.required]],
  //     template: ['', [Validators.required]],
  //   });
  // }

  // initLeaseNegotiationForm() {
  //   this.leaseNegotiationForm = this.formBuilder.group({
  //     templateValues: ['', [Validators.required]],
  //     dynamicVariables: this.formBuilder.group({}),
  //   });
  // }

  initLeaseDocumentsForm() {
    this.leaseDocumentsForm = this.formBuilder.group({
      documents: [[], [Validators.required]],
    });
  }

  buildLeaseSteps(): StepSchema[] {
    const steps: StepSchema[] = [
      {
        id: 'PROPERTY_DETAILS',
        title: 'Property Details',
        formGroup: this.propertyDetailsForm,
      },
      {
        id: 'TENANT_DETAILS',
        title: 'Tenant Details',
        formGroup: this.tenantDetailsForm,
      },
      {
        id: 'LEASE_DETAILS',
        title: 'Lease Details',
        formGroup: this.leaseDetailsForm,
        load: (context) => this.getLeasePropertyDetails(context),
        save: (payload, context) => this.savePropertyDetails(payload, context),
        mapIn: (response) => this.patchPropertyDetails(response),
        mapOut: (value) => this.mapOutPropertyDetails(value),
      },
      // {
      //   id: 'DOCUMENTS_LAYOUT',
      //   title: 'Document Layout',
      //   formGroup: this.leaseDocumentLayoutForm,
      // },
      // {
      //   id: 'NEGOTIATION',
      //   title: 'Negotiation',
      //   formGroup: this.leaseNegotiationForm,
      //   save: (payload, context) =>
      //     this.saveNegotiationDetails(payload, context),
      //   mapOut: (value) => this.mapOutNegotiationDetails(value),
      // },
      {
        id: 'PAYMENT_DETAIL',
        title: 'Payment Detail',
        formGroup: this.paymentDetailsForm,
      },
      {
        id: 'TERMS_&_CONDITIONS',
        title: 'Terms & Conditions',
        formGroup: this.paymentDetailsForm,
      },
      {
        id: 'UPLOAD_EJARI',
        title: 'Documents',
        formGroup: this.leaseDocumentsForm,
        save: (payload, context) => this.saveDocumentsDetails(payload, context),
        mapOut: (value) => this.mapOutDocumentDetails(value),
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
      .getLease({
        lease_id: context.formId,
      })
      .pipe(tap((resp) => this.applyStepStatus(resp.content.step_status)));
  }

  savePropertyDetails(payload: Record<string, any>, context: any) {
    const mode = this.engine()?.getCurrentStepFormMode();
    if (mode === 'EDIT') {
      payload['lease_id'] = context.formId;
      return this.leaseService.editLease(payload);
    } else {
      return this.leaseService.addLease(payload);
    }
  }

  patchPropertyDetails(response: any) {
    const content: any = response.content;
    return {
      property: content.property,
      tenant: content.tenant,
      startDate: this.getEpochToObject(content.lease_start_date),
      endDate: this.getEpochToObject(content.lease_end_date),
      graceStartDate: this.getEpochToObject(content.lease_grace_start_date),
      graceEndDate: this.getEpochToObject(content.lease_grace_end_date),
      remark: content.lease_remarks,
      annualAmount: content?.commercial_details?.annual_amount,
      actualAnnualAmount: content?.commercial_details?.actual_annual_amount,
      bookingAmount: content?.commercial_details?.booking_amount,
      maintenanceCharges: content?.commercial_details?.maintenance_charges,
      rent: content?.commercial_details?.rent,
      securityDeposite: content?.commercial_details?.security_deposit,
      commission: content?.commercial_details?.commission_percentage,
      noticePeriod: content?.commercial_details?.notice_period,
      discount: content?.commercial_details?.discount,
    };
  }

  mapOutPropertyDetails(value: any): Record<string, any> {
    const data: any = {
      property_id: this.propertyDetailsForm.value.unit?.key,
      tenant_id: this.tenantDetailsForm.value.tenant?.key,
      lease_start_date: this.getObjectToEpoch(value.startDate),
      lease_end_date: this.getObjectToEpoch(value.endDate),
      lease_grace_start_date: this.getObjectToEpoch(value.graceStartDate),
      lease_grace_end_date: this.getObjectToEpoch(value.graceEndDate),
      lease_remarks: value?.remark,
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

  // saveNegotiationDetails(payload: Record<string, any>, context: any) {
  //   const mode = this.engine()?.getCurrentStepFormMode();
  //   payload['lease_id'] = context.formId;
  //   if (mode === 'EDIT') {
  //     return this.leaseService.addTemplateData(payload);
  //   } else {
  //     return this.leaseService.addTemplateData(payload);
  //   }
  // }

  // mapOutNegotiationDetails(value: any): Record<string, any> {
  //   let data: any = {};

  //   const docLayoutFormValue = this.leaseDocumentLayoutForm.value;
  //   const selectedDocLayout = docLayoutFormValue.documentLayout;

  //   if (selectedDocLayout === 'predefinedTemplate') {
  //     data = {
  //       ...data,
  //       values: value.templateValues,
  //       template_id: docLayoutFormValue.template,
  //     };
  //   }

  //   return data;
  // }

  saveDocumentsDetails(payload: Record<string, any>, context: any) {
    const mode = this.engine()?.getCurrentStepFormMode();
    payload['lease_id'] = context.formId;
    if (mode === 'EDIT') {
      return this.leaseService.addEjariDocuments(payload);
    } else {
      return this.leaseService.addEjariDocuments(payload);
    }
  }

  mapOutDocumentDetails(value: any): Record<string, any> {
    const documents = value.documents
      .filter((i: any) => !i?.backendId)
      .map((i: any) => ({
        data: i.base64,
        file_name: i.file_name,
        type: i.type,
      }));

    return { documents };
  }
}
