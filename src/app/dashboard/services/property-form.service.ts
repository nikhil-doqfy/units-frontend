import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PropertyService } from './property.service';
import { FormStaus } from '../model/property.model';
import { AlertService } from '../../shared/services/alert.service';
import { pipe, Subject, takeUntil } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PropertyFormService {
  private formBuilder = inject(FormBuilder);
  private propertyService = inject(PropertyService);
  private alertService = inject(AlertService);
  propertyBasicDetailsForm!: FormGroup;
  propertyCommercialsForm!: FormGroup;
  propertyImagesForm!: FormGroup;
  propertyDocumentationForm!: FormGroup;
  formMap!: Record<number, FormGroup>;
  formStatus: Record<number, FormStaus> = {
    0: 'ONGOING',
    1: 'READY_TO_START',
    2: 'READY_TO_START',
    3: 'READY_TO_START',
  };
  propertyID: number | undefined;
  destroy$ = new Subject<void>();

  constructor() {
    this.initPropertyBasicDetailsForm();
    this.initPropertyCommercialsForm();
    this.initPropertyImagesForm();
    this.initPropertyDocumentationForm();
    this.setFormMap();
  }

  updateFormStatus(step: number, status: FormStaus) {
    this.formStatus[step] = status;
  }

  getFormStatus(step: number): FormStaus {
    return this.formStatus[step];
  }

  initPropertyBasicDetailsForm() {
    this.propertyBasicDetailsForm = this.formBuilder.group({
      propertyId: [''],
      propertyName: ['', [Validators.required]],
      propertyType: ['', [Validators.required]],
      landArea: ['', [Validators.required]],
      landDMNo: ['', [Validators.required]],
      apartmentNo: ['', [Validators.required]],
      address: ['', [Validators.required]],
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
      propertyId: ['', [Validators.required]],
      rent: ['', [Validators.required]],
      securityDeposit: ['', [Validators.required]],
      bookingAmount: ['', [Validators.required]],
      maintenanceCharges: ['', [Validators.required]],
      cycle: ['', [Validators.required]],
      noticePeriod: ['', [Validators.required]],
      commission: ['', [Validators.required]],
    });
  }

  initPropertyImagesForm() {
    this.propertyImagesForm = this.formBuilder.group({
      propertyId: ['', [Validators.required]],
      images: [[], [Validators.required]],
    });
  }

  initPropertyDocumentationForm() {
    this.propertyDocumentationForm = this.formBuilder.group({
      propertyId: ['18', [Validators.required]],
      documents: [[], [Validators.required]],
    });
  }

  clearAllForms() {
    [
      this.propertyBasicDetailsForm,
      this.propertyCommercialsForm,
      this.propertyImagesForm,
      this.propertyDocumentationForm,
    ].forEach((form) => form.reset());
  }

  private setFormMap() {
    this.formMap = {
      0: this.propertyBasicDetailsForm,
      1: this.propertyCommercialsForm,
      2: this.propertyImagesForm,
      3: this.propertyDocumentationForm,
    };
  }

  getBasicDetailsForm(): Record<string, any> {
    const formValue = this.propertyBasicDetailsForm.value;
    const data: any = {
      property_name: formValue.propertyName,
      property_type: formValue.propertyType.key,
      land_area: formValue.landArea,
      land_dm_no: formValue.landDMNo,
      apartment_no: formValue.apartmentNo,
      address: formValue.address,
      bedrooms: formValue.NoOfBedrooms,
      area_of_property: formValue.areaOfProperty,
      no_of_floors: formValue.NoOfFloors,
      no_of_parking: formValue.NoOfParking,
      balcony: formValue.NoOfBalcony,
      plot_no: formValue.plotNo,
      makani_no: formValue.makaniNo,
      dewa_no: formValue.dewaNo,
      apartment_floor_no: '4',
      area_unit: 'Sq-ft',
      land_area_unit: 'Sq-ft',
    };
    return data;
  }

  getCommercialDetailsForm(): Record<string, any> {
    const v = this.propertyCommercialsForm.value;

    return {
      property_id: v.propertyId,
      rent: v.rent,
      security_deposit: v.securityDeposit,
      booking_amount: v.bookingAmount,
      maintenance_charges: v.maintenanceCharges,
      cycle: v.cycle?.key,
      notice_period: v.noticePeriod?.key,
      commission_percent: v.commission,
    };
  }

  getImagesForm(): Record<string, any> {
    const v = this.propertyImagesForm.value;

    const images = v.images.map((i: any) => ({
      data: i.data,
      file_name: i.file_name,
      type: i.type,
    }));

    return {
      property_id: v.propertyId,
      images,
    };
  }

  getDocumentationForm(): Record<string, any> {
    const v = this.propertyDocumentationForm.value;

    const documents = v.documents.map((d: any) => ({
      data: d.data,
      file_name: d.file_name,
      type: d.type,
    }));

    return {
      property_id: v.propertyId,
      documents,
    };
  }

  buildPayloadForStep(step: number) {
    switch (step) {
      case 0:
        return this.getBasicDetailsForm();
      case 1:
        return this.getCommercialDetailsForm();
      case 2:
        return this.getImagesForm();
      case 3:
        return this.getDocumentationForm();
      default:
        return null;
    }
  }

  getApiHandlerForStep(step: number) {
    switch (step) {
      case 0:
        return this.propertyService.addBasicDetailsOfProperty.bind(
          this.propertyService
        );

      case 1:
        return this.propertyService.addCommercialDetailsOfProperty.bind(
          this.propertyService
        );

      case 2:
        return this.propertyService.addPropertyImages.bind(
          this.propertyService
        );

      case 3:
        return this.propertyService.addPropertyDocuments.bind(
          this.propertyService
        );

      default:
        return null;
    }
  }

  patchPropertyIDToAllForm(propertyId: number) {
    [
      this.propertyBasicDetailsForm,
      this.propertyCommercialsForm,
      this.propertyImagesForm,
      this.propertyDocumentationForm,
    ].forEach((form) => form.patchValue({ propertyId }));
  }

  savePrpertyDetails(step: number) {
    return new Promise((resolve, reject) => {
      const currentForm = this.formMap[step];

      if (!currentForm) {
        reject('FORM_NOT_FOUND');
        return;
      }

      if (currentForm.invalid) {
        currentForm.markAllAsTouched();
        this.updateFormStatus(step, 'ONGOING'); // still editing
        reject('INVALID_FORM');
        return;
      }

      const payload = this.buildPayloadForStep(step);
      const handler = this.getApiHandlerForStep(step);

      if (!payload || !handler) {
        reject('FORM_DATA_NOT_FOUND');
        return;
      }

      this.updateFormStatus(step, 'ONGOING'); // API starting

      handler(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            this.alertService.success(res.message);
            this.updateFormStatus(step, 'COMPLETED'); // step done
            const propertyId = res?.content?.property_id;
            this.propertyID = propertyId ?? this.propertyID;
            if (this.propertyID) this.patchPropertyIDToAllForm(this.propertyID);
            resolve(res);
          },
          error: (err) => {
            this.updateFormStatus(step, 'ONGOING'); // still work in progress
            reject(err);
          },
        });
    });
  }

  loadPropertyData(propertyId: number) {}

  unsubcribe() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
