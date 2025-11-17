import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PropertyService } from './property.service';
import { FormStaus } from '../model/property.model';
import { AlertService } from '../../shared/services/alert.service';

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
      propertyId: [''],
      exterior: [''],
      interior: [''],
    });
  }

  initPropertyDocumentationForm() {
    this.propertyDocumentationForm = this.formBuilder.group({
      propertyId: [''],
      propertyFloorPlan: [''],
      tenantDocs: [''],
      ejariCertificates: [''],
      PMCDocs: [''],
      cheque: [''],
    });
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
      commission: v.commission,
    };
  }

  getImagesForm(): Record<string, any> {
    const v = this.propertyImagesForm.value;

    return {
      property_id: v.propertyId,
      exterior: v.exterior, // base64 or url
      interior: v.interior,
    };
  }

  getDocumentationForm(): Record<string, any> {
    const v = this.propertyDocumentationForm.value;

    return {
      property_id: v.propertyId,
      property_floor_plan: v.propertyFloorPlan,
      tenant_docs: v.tenantDocs,
      ejari_certificates: v.ejariCertificates,
      pmc_docs: v.PMCDocs,
      cheque: v.cheque,
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

      handler(payload).subscribe({
        next: (res) => {
          this.alertService.success(res.message);
          this.updateFormStatus(step, 'COMPLETED'); // step done
          resolve(res);
        },
        error: (err) => {
          this.updateFormStatus(step, 'ONGOING'); // still work in progress
          reject(err);
        },
      });
    });
  }
}
