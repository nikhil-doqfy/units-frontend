import { inject, Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PropertyService } from './property.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { StepSchema } from '../model/step-engine/step-schema';
import { StepEngine } from '../model/step-engine/step-engine';
import { StorageService } from '../../shared/services/storage.service';
import { UserRole } from '../../theme.service';

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
  propertyManagerDetailsForm!: FormGroup;
  propertyBlocksForm!: FormGroup;

  constructor() {
    this.initPropertyBasicDetailsForm();
    this.initPropertyCommercialsForm();
    this.initPropertyImagesForm();
    this.initPropertyDocumentationForm();
    this.initPropertyManagerDetailsForm();
    this.initPropertyBlocksForm();
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
      owner: [''],
    });

    // if (this.storageServigetPropertyce.getUserRole() === 'owner') {
    //   this.propertyCommercialsForm
    //     .get('pmc')
    //     ?.setValidators([Validators.required]);
    //   this.propertyCommercialsForm.updateValueAndValidity();
    // }
  }

  initPropertyBlocksForm() {
    this.propertyBlocksForm = this.formBuilder.group({
      blocks: this.formBuilder.array([this.createBlockGroup()]),
    });
  }

  createBlockGroup(): FormGroup {
    return this.formBuilder.group({
      blockName: [''],
      noOfFloors: [''],
      noOfParking: [''],
      noOfUnits: [''],
      makaniNo: [''],
    });
  }

  get propertyBlocksArray(): FormArray {
    return this.propertyBlocksForm.get('blocks') as FormArray;
  }

  initPropertyManagerDetailsForm() {
    this.propertyManagerDetailsForm = this.formBuilder.group({
      // Basic Details
      propertyName: ['', [Validators.required]],
      noOfBlocks: ['', [Validators.required]],
      noOfUnits: ['', [Validators.required]],
      propertyType: ['', [Validators.required]],
      landArea: [''],
      landAreaUnit: [''],
      landDmNo: [''],
      plotNo: [''],
      makaniNo: [''],
      dewaNo: [''],
      approxRent: [''],
      // Location / Address
      addressLane1: [''],
      addressLane2: [''],
      landmark: [''],
      pincode: [''],
      latitude: [''],
      longitude: [''],
      mapAddress: [''],
    });
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

  buildPropertySteps(role: UserRole = 'owner'): StepSchema[] {
    const imageStep: StepSchema = {
      id: 'PROPERTY_IMAGES_DETAILS',
      title: 'Property Image Details',
      formGroup: this.propertyImagesForm,
      load: (context) => this.getImageDetails(context),
      save: (payload, context) => this.saveImagesDetails(payload, context),
      mapIn: (response) => this.patchImageDetails(response),
      mapOut: (value) => this.mapOutImagesDetails(value),
    };

    const documentStep: StepSchema = {
      id: 'DOCUMENTS_DETAILS',
      title: 'Document Details',
      formGroup: this.propertyDocumentationForm,
      load: (context) => this.getDocumentDetails(context),
      save: (payload, context) => this.saveDocumentsDetails(payload, context),
      mapIn: (response) => this.patchDocumentDetails(response),
      mapOut: (value) => this.mapOutDocumentsDetails(value),
    };

    const blocksStep: StepSchema = {
      id: 'BLOCKS_DETAILS',
      title: 'Blocks / Tower Details',
      formGroup: this.propertyBlocksForm,
      load: (context) => this.getBlocksDetails(context),
      save: (payload, context) => this.saveBlocksDetails(payload, context),
      mapIn: (response) => this.patchBlocksDetails(response),
      mapOut: (value) => this.mapOutBlocksDetails(value),
    };

    if (role === 'property-manager') {
      return [
        {
          id: 'BASIC_DETAILS',
          title: 'Property Details',
          formGroup: this.propertyManagerDetailsForm,
          load: (context) => this.getPropertyForEdit(context),
          save: (payload, context) => this.savePMDetails(payload, context),
          mapIn: (response) => this.patchPMDetails(response),
          mapOut: (value) => this.mapOutPMDetails(value),
        },
        blocksStep,
        imageStep,
        documentStep,
      ];
    }

    return [
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
      imageStep,
      documentStep,
    ];
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

  getPropertyForEdit(context: any) {
    return this.propertyService.getProperties({ property_id: context.formId });
  }

  getBasicDetails(context: any) {
    return this.propertyService
      .getPropertyUnit({
        property_unit_id: context.formId,
      })
      .pipe(tap((resp: any) => this.applyStepStatus(resp.content.step_status)));
  }

  getCommercialDetails(context: any) {
    return this.propertyService
      .getPropertyUnit({
        property_unit_id: context.formId,
      })
      .pipe(tap((resp: any) => this.applyStepStatus(resp.content.step_status)));
  }

  getImageDetails(context: any) {
    return this.propertyService.getPropertyImages({
      property_id: context.formId,
    });
  }

  getDocumentDetails(context: any) {
    return this.propertyService.getPropertyDocuments({
      property_id: context.formId,
    });
  }

  saveBasicDetails(
    payload: Record<string, any>,
    context: any,
  ): Observable<any> {
    const mode = this.engine.value?.getCurrentStepFormMode();
    if (mode === 'EDIT') {
      payload['property_unit_id'] = context.formId;
      return this.propertyService.editPropertyUnit(payload);
    } else {
      return this.propertyService.addPropertyUnit(payload).pipe(
        tap((resp: any) => {
          if (resp?.content?.id) {
            this.engine.value?.setFormId(resp.content.id);
          }
        }),
      );
    }
  }

  savePMDetails(payload: Record<string, any>, context: any): Observable<any> {
    const mode = this.engine.value?.getCurrentStepFormMode();
    if (mode === 'EDIT') {
      payload['property_id'] = context.formId;
      return this.propertyService.editProperty(payload);
    } else {
      return this.propertyService.addProperty(payload).pipe(
        tap((resp: any) => {
          if (resp?.content?.id) {
            this.engine.value?.setFormId(resp.content.id);
          }
        }),
      );
    }
  }

  getBlocksDetails(context: any) {
    return this.propertyService.getPropertyBlocks({
      property_id: context.formId,
    });
  }

  saveBlocksDetails(
    payload: Record<string, any>,
    context: any,
  ): Observable<any> {
    payload['property_id'] = context.formId;
    const mode = this.engine.value?.getCurrentStepFormMode();
    if (mode === 'EDIT') {
      return this.propertyService.editPropertyBlocks(payload);
    } else {
      return this.propertyService.addPropertyBlocks(payload);
    }
  }

  patchBlocksDetails(response: any) {
    const blocks: any[] = response.content || [];
    while (this.propertyBlocksArray.length > 0) {
      this.propertyBlocksArray.removeAt(0);
    }
    const count = blocks.length > 0 ? blocks.length : 1;
    for (let i = 0; i < count; i++) {
      this.propertyBlocksArray.push(this.createBlockGroup());
    }
    blocks.forEach((b: any, i: number) => {
      this.propertyBlocksArray.at(i).patchValue({
        blockName: b.block_name,
        noOfFloors: { key: b.no_of_floors, value: String(b.no_of_floors) },
        noOfParking: { key: b.no_of_parking, value: String(b.no_of_parking) },
        noOfUnits: { key: b.no_of_units, value: String(b.no_of_units) },
      });
    });
    return {};
  }

  mapOutBlocksDetails(value: any): Record<string, any> {
    const blocks = (value.blocks || []).map((b: any) => ({
      block_name: b.blockName,
      no_of_floors: b.noOfFloors?.key ?? b.noOfFloors,
      no_of_parking: b.noOfParking?.key ?? b.noOfParking,
      no_of_units: b.noOfUnits?.key ?? b.noOfUnits,
      makani_no: b.makaniNo,
    }));
    return { blocks };
  }

  patchPMDetails(response: any) {
    const content: any = response.content;

    return {
      propertyName: content?.property_name,
      noOfBlocks: {
        key: content?.no_of_blocks,
        value: String(content?.no_of_blocks ?? ''),
      },
      noOfUnits: {
        key: content?.no_of_units,
        value: String(content?.no_of_units ?? ''),
      },
      propertyType: {
        key: content?.property_type,
        value: content?.property_type,
      },
      landArea: content?.land_area,
      landAreaUnit: {
        key: content?.land_area_unit,
        value: content?.land_area_unit,
      },
      landDmNo: content?.land_dm_no,
      plotNo: content?.plot_no,
      makaniNo: content?.makani_no,
      dewaNo: content?.dewa_no,
      approxRent: content?.approx_rent,
      addressLane1: content?.address_line_1,
      addressLane2: content?.address_line_2,
      landmark: content?.landmark,
      pincode: content?.pincode,
      latitude: content?.latitude,
      longitude: content?.longitude,
      mapAddress: content?.map_address,
    };
  }

  mapOutPMDetails(value: any): Record<string, any> {
    return {
      property_name: value.propertyName,
      no_of_blocks: value.noOfBlocks?.key ?? value.noOfBlocks,
      no_of_units: value.noOfUnits?.key ?? value.noOfUnits,
      property_type: value.propertyType?.key ?? value.propertyType,
      land_area: value.landArea,
      land_area_unit: value.landAreaUnit?.key ?? value.landAreaUnit,
      land_dm_no: value.landDmNo,
      plot_no: value.plotNo,
      makani_no: value.makaniNo,
      dewa_no: value.dewaNo,
      approx_rent: value.approxRent || null,
      address_line_1: value.addressLane1,
      address_line_2: value.addressLane2,
      landmark: value.landmark,
      pincode: value.pincode,
      latitude: value.latitude || null,
      longitude: value.longitude || null,
      map_address: value.mapAddress || null,
    };
  }

  saveCommercialDetails(payload: Record<string, any>, context: any) {
    payload['property_unit_id'] = context.formId;
    const mode = this.engine.value?.getCurrentStepFormMode();
    if (mode === 'EDIT') {
      return this.propertyService.editPropertyUnit(payload);
    } else {
      return this.propertyService.editPropertyUnit(payload);
    }
  }

  saveImagesDetails(payload: Record<string, any>, context: any) {
    payload['property_id'] = context.formId;
    return this.propertyService.addPropertyImages(payload);
  }

  saveDocumentsDetails(payload: Record<string, any>, context: any) {
    payload['property_id'] = context.formId;
    return this.propertyService.addPropertyDocuments(payload);
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
      country: content?.property?.country,
      state: content?.property?.state,
      city: content?.property?.city,
      locality: content?.property?.locality,
      addressLine1: content.address,
      addressLine2: content?.property?.additional_address,
      postalCode: content?.property?.postal_code,
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
      pmc: content?.compnay,
      owner: content?.owner,
    };
  }

  patchImageDetails(response: any) {
    const images: any[] = response.content || [];
    return {
      images: images.map((i: any) => ({
        backendId: i.id,
        file_name: i.file_name,
        file: { name: i.file_name },
        base64: i.url,
        status: 'done',
        progress: 100,
        type: i.image_type,
      })),
    };
  }

  patchDocumentDetails(response: any) {
    const docs: any[] = response.content || [];
    return {
      documents: docs.map((d: any) => ({
        backendId: d.id,
        file_name: d.file_name,
        file: { name: d.file_name },
        base64: d.url,
        status: 'done',
        progress: 100,
        type: d.document_type_id,
      })),
    };
  }

  mapOutBasicDetails(value: any): Record<string, any> {
    const data: any = {
      property_unit_name: value.propertyUnitName,
      land_dm_no: value.landDMNo,
      area_of_property: value.areaOfProperty,
      no_of_parking: value.NoOfParking,
      makani_no: value.makaniNo,
      dewa_no: value.dewaNo,
      property_type: value.propertyType.key,
      land_area: value.landArea,
      apartment_no: value.apartmentNo,
      bedrooms: value.NoOfBedrooms,
      balcony: value.NoOfBalcony,
      plot_no: value.plotNo,
      area_unit: 'SQFT',
      land_area_unit: 'SQFT',
      apartment_floor_no: '',
      no_of_floors: value.NoOfFloors,
      address: value.addressLine1,
    };
    if (value.property?.isNew) {
      data['parent_property_name'] = value.property.value;
      data['additional_address'] = value.addressLine2;
      data['locality'] = value.locality;
      data['postal_code'] = value.postalCode;
      data['city_id'] = value.city.key;
    } else {
      data['parent_property_id'] = value.property.key;
    }
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
      data['company_id'] = value.pmc?.key;
    } else if (this.storageService.getUserRole() === 'property-manager') {
      data['owner_id'] = value.owner?.key;
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
        document_type_id: i.type,
      }));

    return { documents };
  }
}
