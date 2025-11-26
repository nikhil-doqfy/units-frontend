import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PropertyService } from './property.service';
import { FormStaus, PropertyFormStep } from '../model/property.model';
import { AlertService } from '../../shared/services/alert.service';
import { firstValueFrom, Observable, pipe, Subject, takeUntil } from 'rxjs';

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
  formMap!: Record<PropertyFormStep, FormGroup>;
  formStatus: Record<PropertyFormStep, FormStaus> = {
    0: 'ONGOING',
    1: 'READY_TO_START',
    2: 'READY_TO_START',
    3: 'READY_TO_START',
  };
  private stepApiMap: Record<
    PropertyFormStep,
    {
      add: (data: any) => Observable<any>;
      edit: (data: any) => Observable<any>;
    }
  > = {
    0: {
      add: this.propertyService.addBasicDetailsOfProperty.bind(
        this.propertyService
      ),
      edit: this.propertyService.editBasicDetailsOfProperty.bind(
        this.propertyService
      ),
    },
    1: {
      add: this.propertyService.addCommercialDetailsOfProperty.bind(
        this.propertyService
      ),
      edit: this.propertyService.editCommercialDetailsOfProperty.bind(
        this.propertyService
      ),
    },
    2: {
      add: this.propertyService.addPropertyImages.bind(this.propertyService),
      edit: this.propertyService.editPropertyImages.bind(this.propertyService),
    },
    3: {
      add: this.propertyService.addPropertyDocuments.bind(this.propertyService),
      edit: this.propertyService.editPropertyDocuments.bind(
        this.propertyService
      ),
    },
  } as const;
  propertyID: number | undefined;
  destroy$ = new Subject<void>();

  constructor() {
    this.initPropertyBasicDetailsForm();
    this.initPropertyCommercialsForm();
    this.initPropertyImagesForm();
    this.initPropertyDocumentationForm();
    this.setFormMap();
  }

  updateFormStatus(step: PropertyFormStep, status: FormStaus) {
    this.formStatus[step] = status;
  }

  getFormStatus(step: PropertyFormStep): FormStaus {
    return this.formStatus[step];
  }

  setFormStatusToStart() {
    const status: FormStaus[] = [
      'ONGOING',
      'READY_TO_START',
      'READY_TO_START',
      'READY_TO_START',
    ];
    const steps: PropertyFormStep[] = [0, 1, 2, 3];
    steps.forEach((step: PropertyFormStep) =>
      this.updateFormStatus(step, status[step])
    );
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
    if (this.getFormStatus(0) === 'COMPLETED') {
      data['property_id'] = formValue.propertyId;
    }
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
      cycle: v.cycle,
      notice_period: v.noticePeriod,
      commission_percent: v.commission,
    };
  }

  getImagesForm(): Record<string, any> {
    const v = this.propertyImagesForm.value;

    const images = v.images
      .filter((i: any) => !i?.backendId)
      .map((i: any) => ({
        data: i.base64,
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

    const documents = v.documents
      .filter((i: any) => !i?.backendId)
      .map((d: any) => ({
        data: d.base64,
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

  getApiHandlerForStep(step: PropertyFormStep) {
    const config = this.stepApiMap[step];
    if (!config) return null;

    const status = this.getFormStatus(step);
    return status === 'COMPLETED' ? config.edit : config.add;
  }

  patchPropertyIDToAllForm(propertyId: number) {
    [
      this.propertyBasicDetailsForm,
      this.propertyCommercialsForm,
      this.propertyImagesForm,
      this.propertyDocumentationForm,
    ].forEach((form) => form.patchValue({ propertyId }));
  }

  savePrpertyDetails(step: PropertyFormStep) {
    return new Promise((resolve, reject) => {
      const currentForm = this.formMap[step];

      if (!currentForm) {
        reject('FORM_NOT_FOUND');
        return;
      }

      if (currentForm.invalid) {
        currentForm.markAllAsTouched();
        // It will not change when Edit/PUT
        if (this.getFormStatus(step) !== 'COMPLETED')
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

      // It will not change when Edit/PUT
      if (this.getFormStatus(step) !== 'COMPLETED')
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
            if (this.getFormStatus(step) !== 'COMPLETED')
              this.updateFormStatus(step, 'ONGOING'); // still work in progress
            reject(err);
          },
        });
    });
  }

  private async fetchAndPatch<T>(
    apiCall: Promise<any>,
    mapper: (content: any) => any,
    formGroup: FormGroup
  ) {
    const response = await apiCall;

    if (response.status !== 200) throw 'API_ERROR';
    if (!response?.content) throw 'NO_DATA_FOUND';

    const data = mapper(response.content);
    formGroup.patchValue(data);

    return response.content;
  }

  getAndPatchBasicDetails(propertyId: number) {
    return this.fetchAndPatch(
      firstValueFrom(
        this.propertyService.getBasicDetails({ property_id: propertyId })
      ),
      (content) => ({
        propertyId: content.id,
        propertyName: content.property_name,
        propertyType: content.property_type,
        landArea: content.land_area,
        landDMNo: content.land_dm_no,
        apartmentNo: content.apartment_no,
        address: content.address,
        NoOfBedrooms: content.bedrooms,
        areaOfProperty: content.area_of_property,
        NoOfFloors: content.no_of_floors,
        NoOfParking: content.no_of_parking,
        NoOfBalcony: content.balcony,
        plotNo: content.plot_no,
        makaniNo: content.makani_no,
        dewaNo: content.dewa_no,
      }),
      this.propertyBasicDetailsForm
    );
  }

  getAndPatchCommercialDetails(propertyId: number) {
    return this.fetchAndPatch(
      firstValueFrom(
        this.propertyService.getCommercialDetails({ property_id: propertyId })
      ),
      (content) => ({
        propertyId: content.property_id,
        rent: content.rent,
        securityDeposit: content.security_deposit,
        bookingAmount: content.booking_amount,
        maintenanceCharges: content.maintenance_charges,
        cycle: content.cycle,
        noticePeriod: content.notice_period,
        commission: content.commission_percent,
      }),
      this.propertyCommercialsForm
    );
  }

  getAndPatchPropertyImages(propertyId: number) {
    return this.fetchAndPatch(
      firstValueFrom(
        this.propertyService.getPropertyImages({ property_id: propertyId })
      ),
      (content) => ({
        propertyId: content.property_id,
        images: content.images.map((i: any) => ({
          backendId: i.id,
          file_name: i.file_name,
          file: { name: i.file_name },
          base64: i.data,
          status: 'done',
          progress: 100,
          type: i.type,
        })),
      }),
      this.propertyImagesForm
    );
  }

  getAndPatchPropertyDocuments(propertyId: number) {
    return this.fetchAndPatch(
      firstValueFrom(
        this.propertyService.getPropertyDocuments({ property_id: propertyId })
      ),
      (content) => ({
        propertyId: content.property_id,
        documents: content.documents.map((i: any) => ({
          backendId: i.id,
          file_name: i.file_name,
          file: { name: i.file_name },
          base64: i.data,
          status: 'done',
          progress: 100,
          type: i.type,
        })),
      }),
      this.propertyDocumentationForm
    );
  }

  async loadPropertyData(propertyId: number) {
    if (!propertyId) return;

    this.patchPropertyIDToAllForm(propertyId);

    try {
      const basic = await this.getAndPatchBasicDetails(propertyId);
      this.updateFormStatus(0, 'COMPLETED');

      if (basic.step_choice === 'BASIC_DETAILS') {
        this.updateFormStatus(1, 'ONGOING');
        return;
      }

      const commercials = await this.getAndPatchCommercialDetails(propertyId);
      this.updateFormStatus(1, 'COMPLETED');

      if (commercials.step_choice === 'COMMERCIALS_DETAILS') {
        this.updateFormStatus(2, 'ONGOING');
        return;
      }

      const images = await this.getAndPatchPropertyImages(propertyId);
      this.updateFormStatus(2, 'COMPLETED');

      if (images.step_choice === 'PROPERTY_IMAGES_DETAILS') {
        this.updateFormStatus(3, 'ONGOING');
        return;
      }

      if (images.step_choice === 'DOCUMENTS_DETAILS') {
        await this.getAndPatchPropertyDocuments(propertyId);
        this.updateFormStatus(3, 'COMPLETED');
      }
    } catch (e) {
      console.error('Property Load Error:', e);
    }
  }

  unsubcribe() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
