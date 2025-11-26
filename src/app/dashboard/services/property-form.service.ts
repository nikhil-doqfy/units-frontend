import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PropertyService } from './property.service';
import { FormStaus, PropertyFormStep } from '../model/property.model';
import { AlertService } from '../../shared/services/alert.service';
import { firstValueFrom, Observable, pipe, Subject, takeUntil } from 'rxjs';
import { StepSchema } from '../model/step-engine/step-schema';

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
      propertyId: ['', [Validators.required]],
      documents: [[], [Validators.required]],
    });
  }

  buildPropertySteps(): StepSchema[] {
    const steps: StepSchema[] = [
      {
        id: 'BASIC_DETAILS',
        title: 'Basic Details',
        formGroup: this.propertyBasicDetailsForm,
        mapOut: (value) => this.mapOutBasicDetails(value),
      },
      {
        id: 'COMMERCIAL_DETAILS',
        title: 'Commercial Details',
        formGroup: this.propertyCommercialsForm,
      },
      {
        id: 'PROPERTY_IMAGES_DETAILS',
        title: 'Property Image Details',
        formGroup: this.propertyImagesForm,
      },
      {
        id: 'DOCUMENT_DETAILS',
        title: 'Document Details',
        formGroup: this.propertyDocumentationForm,
      },
    ];

    return steps;
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
    // if (this.getFormStatus(0) === 'COMPLETED') {
    //   data['property_id'] = formValue.propertyId;
    // }
    return data;
  }
}
