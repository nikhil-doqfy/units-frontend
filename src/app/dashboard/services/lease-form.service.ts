import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StepEngine } from '../model/step-engine/step-engine';
import { LeaseService } from './lease.service';
import { StepSchema } from '../model/step-engine/step-schema';

@Injectable({
  providedIn: 'root',
})
export class LeaseFormService {
  private formBuilder = inject(FormBuilder);
  private leaseService = inject(LeaseService);
  private readonly engine: WritableSignal<StepEngine | undefined> =
    signal(undefined);

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
      bookingAmmount: ['', [Validators.required]],
      maintenanceChardges: ['', [Validators.required]],
      rent: ['', [Validators.required]],
      securityDeposite: ['', [Validators.required]],
      commission: ['', [Validators.required]],
      noticePeriod: ['', [Validators.required]],
      discount: [''],
    });
  }

  initLeaseDocumentLayoutForm() {
    this.leaseDocumentLayoutForm = this.formBuilder.group({
      type: ['', [Validators.required]],
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
        id: 'PROPERTY_DETAILS',
        title: 'Property Details',
        formGroup: this.leasePropertyDetailsForm,
      },
      {
        id: 'COMMERCIALS_DETAILS',
        title: 'Commercial Details',
        formGroup: this.leaseCommercialDetailsForm,
      },
      {
        id: 'DOCUMENT_LAYOUT',
        title: 'Document Layout',
        formGroup: this.leaseDocumentLayoutForm,
      },
      {
        id: 'NEGOTIATION',
        title: 'Negotiation',
        formGroup: this.leaseNegotiationForm,
      },
      {
        id: 'DOCUMENTS',
        title: 'Documents',
        formGroup: this.leaseDocumentLayoutForm,
      },
    ];

    return steps;
  }
}
