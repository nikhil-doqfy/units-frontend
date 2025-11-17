import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class PropertyFormService {
  private formBuilder = inject(FormBuilder);
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

  initPropertyBasicDetailsForm() {
    this.propertyBasicDetailsForm = this.formBuilder.group({
      propertyName: [''],
      propertyType: [''],
      landArea: [''],
      landDMNo: [''],
      apartmentNo: [''],
      address: [''],
      NoOfBedrooms: [''],
      areaOfProperty: [''],
      NoOfFloors: [''],
      NoOfParking: [''],
      NoOfBalcony: [''],
      plotNo: [''],
      makaniNo: [''],
      dewaNo: [''],
    });
  }

  initPropertyCommercialsForm() {
    this.propertyCommercialsForm = this.formBuilder.group({
      propertyId: [''],
      rent: [''],
      securityDeposit: [''],
      bookingAmount: [''],
      maintenanceCharges: [''],
      cycle: [''],
      noticePeriod: [''],
      commission: [''],
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
}
