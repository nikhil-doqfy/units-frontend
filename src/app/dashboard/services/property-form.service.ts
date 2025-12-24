import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PropertyService } from './property.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { StepSchema } from '../model/step-engine/step-schema';
import { StepEngine } from '../model/step-engine/step-engine';
import { StorageService } from '../../shared/services/storage.service';

@Injectable({
  providedIn: 'root',
})
export class PropertyFormService {
  private formBuilder = inject(FormBuilder);
  private propertyService = inject(PropertyService);
  private storageService = inject(StorageService);
  private engine = new BehaviorSubject<StepEngine | null>(null);

  propertyBasicDetailsForm!: FormGroup;
  propertyCommercialsForm!: FormGroup;
  propertyImagesForm!: FormGroup;
  propertyDocumentationForm!: FormGroup;

  constructor() {
    this.initPropertyBasicDetailsForm();
    this.initPropertyCommercialsForm();
    this.initPropertyImagesForm();
    this.initPropertyDocumentationForm();
  }

  setEngine(engine: StepEngine) {
    this.engine.next(engine);
  }

  initPropertyBasicDetailsForm() {
    this.propertyBasicDetailsForm = this.formBuilder.group({
      property: ['', [Validators.required]],
      propertyUnitName: ['', [Validators.required]],
      propertyType: ['', [Validators.required]],
      landArea: ['', [Validators.required]],
      landDMNo: ['', [Validators.required]],
      apartmentNo: ['', [Validators.required]],
      country: ['', [Validators.required]],
      state: ['', [Validators.required]],
      city: ['', [Validators.required]],
      locality: ['', [Validators.required]],
      addressLine1: ['', [Validators.required]],
      addressLine2: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      NoOfBedrooms: ['', [Validators.required]],
      areaOfProperty: ['', [Validators.required]],
      NoOfFloors: ['', [Validators.required]],
      NoOfParking: ['', [Validators.required]],
      NoOfBalcony: ['', [Validators.required]],
      plotNo: ['', [Validators.required]],
      makaniNo: ['', [Validators.required]],
      dewaNo: ['', [Validators.required]],
    });
  }

  initPropertyCommercialsForm() {
    this.propertyCommercialsForm = this.formBuilder.group({
      rent: ['', [Validators.required]],
      securityDeposit: ['', [Validators.required]],
      bookingAmount: ['', [Validators.required]],
      maintenanceCharges: ['', [Validators.required]],
      cycle: ['', [Validators.required]],
      noticePeriod: ['', [Validators.required]],
      commission: ['', [Validators.required]],
      pmc: [''],
    });

    if (this.storageService.getUserRole() === 'owner') {
      this.propertyCommercialsForm
        .get('pmc')
        ?.setValidators([Validators.required]);
      this.propertyCommercialsForm.updateValueAndValidity();
    }
  }

  initPropertyImagesForm() {
    this.propertyImagesForm = this.formBuilder.group({
      images: [[], [Validators.required]],
    });
  }

  initPropertyDocumentationForm() {
    this.propertyDocumentationForm = this.formBuilder.group({
      documents: [[], [Validators.required]],
    });
  }

  buildPropertySteps(): StepSchema[] {
    const steps: StepSchema[] = [
      {
        id: 'BASIC_DETAILS',
        title: 'Basic Details',
        formGroup: this.propertyBasicDetailsForm,
        load: (context) => this.getBasicDetails(context),
        save: (payload, context) => this.saveBasicDetails(payload, context),
        mapIn: (response) => this.patchBasicDetails(response),
        mapOut: (value) => this.mapOutBasicDetails(value),
      },
      {
        id: 'COMMERCIALS_DETAILS',
        title: 'Commercial Details',
        formGroup: this.propertyCommercialsForm,
        load: (context) => this.getCommercialDetails(context),
        save: (payload, context) =>
          this.saveCommercialDetails(payload, context),
        mapIn: (response) => this.patchCommercialDetails(response),
        mapOut: (value) => this.mapOutCommercialDetails(value),
      },
      {
        id: 'PROPERTY_IMAGES_DETAILS',
        title: 'Property Image Details',
        formGroup: this.propertyImagesForm,
        load: (context) => this.getImageDetails(context),
        save: (payload, context) => this.saveImagesDetails(payload, context),
        mapIn: (response) => this.patchImageDetails(response),
        mapOut: (value) => this.mapOutImagesDetails(value),
      },
      {
        id: 'DOCUMENTS_DETAILS',
        title: 'Document Details',
        formGroup: this.propertyDocumentationForm,
        load: (context) => this.getDocumentDetails(context),
        save: (payload, context) => this.saveDocumentsDetails(payload, context),
        mapIn: (response) => this.patchDocumentDetails(response),
        mapOut: (value) => this.mapOutDocumentsDetails(value),
      },
    ];

    return steps;
  }

  private applyStepStatus(stepChoice: string) {
    const steps = this.engine.value?.getSteps()?.map((s) => s.id);
    if (!steps) return;

    const idx = steps.indexOf(stepChoice);

    steps.forEach((step, i) => {
      const status =
        i <= idx ? 'COMPLETED' : i === idx + 1 ? 'ONGOING' : 'LOCKED';
      const mode = i <= idx ? 'EDIT' : 'ADD';

      this.engine.value?.setStepStatus(step, status);
      this.engine.value?.setStepFormMode(step, mode);
    });
  }

  getBasicDetails(context: any) {
    return this.propertyService
      .getProperty({
        property_id: context.formId,
      })
      .pipe(tap((resp: any) => this.applyStepStatus(resp.content.step_choice)));
  }

  getCommercialDetails(context: any) {
    return this.propertyService
      .getCommercialDetails({
        property_id: context.formId,
      })
      .pipe(tap((resp: any) => this.applyStepStatus(resp.content.step_choice)));
  }

  getImageDetails(context: any) {
    return this.propertyService
      .getPropertyImages({
        property_id: context.formId,
      })
      .pipe(tap((resp: any) => this.applyStepStatus(resp.content.step_choice)));
  }

  getDocumentDetails(context: any) {
    return this.propertyService
      .getPropertyDocuments({
        property_id: context.formId,
      })
      .pipe(tap((resp: any) => this.applyStepStatus(resp.content.step_choice)));
  }

  saveBasicDetails(
    payload: Record<string, any>,
    context: any
  ): Observable<any> {
    const mode = this.engine.value?.getCurrentStepFormMode();
    if (mode === 'EDIT') {
      payload['property_id'] = context.formId;
      return this.propertyService.editProperty(payload);
    } else {
      return this.propertyService.addProperty(payload);
    }
  }

  saveCommercialDetails(payload: Record<string, any>, context: any) {
    payload['property_id'] = context.formId;
    const mode = this.engine.value?.getCurrentStepFormMode();
    if (mode === 'EDIT') {
      return this.propertyService.editCommercialDetailsOfProperty(payload);
    } else {
      return this.propertyService.addCommercialDetailsOfProperty(payload);
    }
  }

  saveImagesDetails(payload: Record<string, any>, context: any) {
    payload['property_id'] = context.formId;
    const mode = this.engine.value?.getCurrentStepFormMode();
    if (mode === 'EDIT') {
      return this.propertyService.editPropertyImages(payload);
    } else {
      return this.propertyService.addPropertyImages(payload);
    }
  }

  saveDocumentsDetails(payload: Record<string, any>, context: any) {
    payload['property_id'] = context.formId;
    const mode = this.engine.value?.getCurrentStepFormMode();
    if (mode === 'EDIT') {
      return this.propertyService.editPropertyDocuments(payload);
    } else {
      return this.propertyService.addPropertyDocuments(payload);
    }
  }

  patchBasicDetails(response: any) {
    const content: any = response.content;
    return {
      property: {
        key: content?.property?.id,
        value: content?.property?.property_name,
      },
      propertyUnitName: content?.property_unit_name,
      propertyType: content?.property?.property_type,
      landArea: content.land_area,
      landDMNo: content.land_dm_no,
      apartmentNo: content.apartment_no,
      addressLine1: content.address,
      addressLine2: content?.property?.additional_address,
      NoOfBedrooms: content.bedrooms,
      areaOfProperty: content.area_of_property,
      NoOfFloors: content.no_of_floors,
      NoOfParking: content.no_of_parking,
      NoOfBalcony: content.balcony,
      plotNo: content.plot_no,
      makaniNo: content.makani_no,
      dewaNo: content.dewa_no,
    };
  }

  patchCommercialDetails(response: any) {
    const content: any = response.content;
    return {
      rent: content.rent,
      securityDeposit: content.security_deposit,
      bookingAmount: content.booking_amount,
      maintenanceCharges: content.maintenance_charges,
      cycle: content.cycle,
      noticePeriod: content.notice_period,
      commission: content.commission_percent,
      pmc: content?.pmc,
    };
  }

  patchImageDetails(response: any) {
    const content: any = response.content;
    return {
      images: content.images.map((i: any) => ({
        backendId: i.id,
        file_name: i.file_name,
        file: { name: i.file_name },
        base64: i.data,
        status: 'done',
        progress: 100,
        type: i.type,
      })),
    };
  }

  patchDocumentDetails(response: any) {
    const content: any = response.content;
    return {
      documents: content.documents.map((i: any) => ({
        backendId: i.id,
        file_name: i.file_name,
        file: { name: i.file_name },
        base64: i.data,
        status: 'done',
        progress: 100,
        type: i.type,
      })),
    };
  }

  mapOutBasicDetails(value: any): Record<string, any> {
    const data: any = {
      property_name: value.propertyName,
      property_type: value.propertyType.key,
      land_area: value.landArea,
      land_dm_no: value.landDMNo,
      apartment_no: value.apartmentNo,
      address: value.address,
      bedrooms: value.NoOfBedrooms,
      area_of_property: value.areaOfProperty,
      no_of_floors: value.NoOfFloors,
      no_of_parking: value.NoOfParking,
      balcony: value.NoOfBalcony,
      plot_no: value.plotNo,
      makani_no: value.makaniNo,
      dewa_no: value.dewaNo,
      apartment_floor_no: '',
      area_unit: 'Sq-ft',
      land_area_unit: 'Sq-ft',
    };
    return data;
  }

  mapOutCommercialDetails(value: any): Record<string, any> {
    const data: any = {
      rent: value.rent,
      security_deposit: value.securityDeposit,
      booking_amount: value.bookingAmount,
      maintenance_charges: value.maintenanceCharges,
      cycle: value.cycle,
      notice_period: value.noticePeriod,
      commission_percent: value.commission,
    };
    if (this.storageService.getUserRole() === 'owner') {
      data['pmc_id'] = value.pmc.key;
    }
    return data;
  }

  mapOutImagesDetails(value: any): Record<string, any> {
    const images = value.images
      .filter((i: any) => !i?.backendId)
      .map((i: any) => ({
        data: i.base64,
        file_name: i.file_name,
        type: i.type,
      }));

    return { images };
  }

  mapOutDocumentsDetails(value: any): Record<string, any> {
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
