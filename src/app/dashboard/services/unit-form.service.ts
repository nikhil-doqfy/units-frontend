import { inject, Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PropertyService } from './property.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { StepSchema } from '../model/step-engine/step-schema';
import { StepEngine } from '../model/step-engine/step-engine';

@Injectable({
  providedIn: 'root',
})
export class UnitFormService {
  private formBuilder = inject(FormBuilder);
  private propertyService = inject(PropertyService);
  private engine = new BehaviorSubject<StepEngine | null>(null);

  unitBasicDetailsForm!: FormGroup;
  unitCommercialsForm!: FormGroup;
  unitImagesForm!: FormGroup;
  unitDocumentationForm!: FormGroup;

  constructor() {
    this.initUnitBasicDetailsForm();
    this.initUnitCommercialsForm();
    this.initUnitImagesForm();
    this.initUnitDocumentationForm();
  }

  setEngine(engine: StepEngine) {
    this.engine.next(engine);
  }

  initUnitBasicDetailsForm() {
    this.unitBasicDetailsForm = this.formBuilder.group({
      unitOwners: this.formBuilder.array([this.createOwnerGroup()]),
      property: ['', [Validators.required]],
      blockId: ['', [Validators.required]],
      unitName: ['', [Validators.required]],
      unitSize: [''],
      area: [''],
      dmNo: [''],
      noOfBedrooms: [''],
      floorNo: [''],
      parkingNo: [''],
      noOfBalcony: [''],
      landNo: [''],
      unitUsage: [''],
      unitType: [''],
      subType: [''],
      makaniNo: [''],
      dewaNo: [''],
    });
  }

  createOwnerGroup(): FormGroup {
    return this.formBuilder.group({
      ownerName: [''],
      ownerEmail: [''],
      ownerContact: [''],
      ownerEmiratesId: [''],
      ownerNumber: [''],
      tradeLicenseNumber: [''],
      licenseNumber: [''],
      licenseExpiryDate: [''],
      licenseIssuer: [''],
      faxNumber: [''],
      poBoxNumber: [''],
    });
  }

  get unitOwnersArray(): FormArray {
    return this.unitBasicDetailsForm.get('unitOwners') as FormArray;
  }

  initUnitCommercialsForm() {
    this.unitCommercialsForm = this.formBuilder.group({
      rent: ['', [Validators.required]],
      securityDeposit: ['', [Validators.required]],
      bookingAmount: ['', [Validators.required]],
      maintenanceCharges: ['', [Validators.required]],
      cycle: ['', [Validators.required]],
      noticePeriod: ['', [Validators.required]],
      commissionPercent: ['', [Validators.required]],
    });
  }

  initUnitImagesForm() {
    this.unitImagesForm = this.formBuilder.group({
      images: [[]],
    });
  }

  initUnitDocumentationForm() {
    this.unitDocumentationForm = this.formBuilder.group({
      documents: [[]],
    });
  }

  buildUnitSteps(): StepSchema[] {
    return [
      {
        id: 'BASIC_DETAILS',
        title: 'Basic Details',
        formGroup: this.unitBasicDetailsForm,
        load: (context) => this.getUnitForEdit(context),
        save: (payload, context) => this.saveUnitBasicDetails(payload, context),
        mapIn: (response) => this.patchUnitBasicDetails(response),
        mapOut: (value) => this.mapOutUnitBasicDetails(value),
      },
      {
        id: 'COMMERCIALS_DETAILS',
        title: 'Commercials',
        formGroup: this.unitCommercialsForm,
        load: (context) => this.getUnitForEdit(context),
        save: (payload, context) => this.saveUnitCommercialsDetails(payload, context),
        mapIn: (response) => this.patchUnitCommercialsDetails(response),
        mapOut: (value) => this.mapOutUnitCommercialsDetails(value),
      },
      {
        id: 'UNIT_IMAGES_DETAILS',
        title: 'Unit Images',
        formGroup: this.unitImagesForm,
        load: (context) => this.getUnitImages(context),
        save: (payload, context) => this.saveUnitImages(payload, context),
        mapIn: (response) => this.patchUnitImages(response),
        mapOut: (value) => this.mapOutUnitImages(value),
      },
      {
        id: 'DOCUMENTS_DETAILS',
        title: 'Documents',
        formGroup: this.unitDocumentationForm,
        load: (context) => this.getUnitDocuments(context),
        save: (payload, context) => this.saveUnitDocuments(payload, context),
        mapIn: (response) => this.patchUnitDocuments(response),
        mapOut: (value) => this.mapOutUnitDocuments(value),
      },
    ];
  }

  getUnitForEdit(context: any): Observable<any> {
    return this.propertyService.getUnits({ unit_id: context.formId });
  }

  saveUnitBasicDetails(payload: Record<string, any>, context: any): Observable<any> {
    const mode = this.engine.value?.getCurrentStepFormMode();
    if (mode === 'EDIT') {
      payload['unit_id'] = context.formId;
      return this.propertyService.editUnit(payload);
    } else {
      return this.propertyService.addUnit(payload).pipe(
        tap((resp: any) => {
          if (resp?.content?.id) {
            this.engine.value?.setFormId(resp.content.id);
          }
        }),
      );
    }
  }

  saveUnitCommercialsDetails(payload: Record<string, any>, context: any): Observable<any> {
    payload['unit_id'] = context.formId;
    return this.propertyService.editUnit(payload);
  }

  getUnitImages(context: any): Observable<any> {
    return this.propertyService.getUnitImages({ unit_id: context.formId });
  }

  saveUnitImages(payload: Record<string, any>, context: any): Observable<any> {
    payload['unit_id'] = context.formId;
    return this.propertyService.addUnitImages(payload);
  }

  getUnitDocuments(context: any): Observable<any> {
    return this.propertyService.getUnitDocuments({ unit_id: context.formId });
  }

  saveUnitDocuments(payload: Record<string, any>, context: any): Observable<any> {
    payload['unit_id'] = context.formId;
    return this.propertyService.addUnitDocuments(payload);
  }

  patchUnitBasicDetails(response: any) {
    const content: any = response.content;

    // Rebuild owners array
    const owners: any[] = content?.unit_owners || [];
    while (this.unitOwnersArray.length > 0) this.unitOwnersArray.removeAt(0);
    const count = owners.length > 0 ? owners.length : 1;
    for (let i = 0; i < count; i++) this.unitOwnersArray.push(this.createOwnerGroup());
    owners.forEach((o: any, i: number) => {
      this.unitOwnersArray.at(i).patchValue({
        ownerName: o.name,
        ownerEmail: o.email,
        ownerContact: o.contact_number,
        ownerEmiratesId: o.emirates_id,
        ownerNumber: o.owner_number,
        tradeLicenseNumber: o.trade_license_number,
        licenseNumber: o.license_number,
        licenseExpiryDate: o.license_expiry_date,
        licenseIssuer: o.license_issuer,
        faxNumber: o.fax_number,
        poBoxNumber: o.po_box_number,
      });
    });

    return {
      property: { key: content?.property_id, value: content?.property_name },
      blockId: { key: content?.block_id, value: content?.block_name },
      unitName: content?.unit_name,
      unitSize: content?.unit_size,
      area: content?.area,
      dmNo: content?.dm_no,
      noOfBedrooms: { key: content?.no_of_bedrooms, value: String(content?.no_of_bedrooms ?? '') },
      floorNo: { key: content?.floor_no, value: String(content?.floor_no ?? '') },
      parkingNo: content?.parking_no,
      noOfBalcony: { key: content?.no_of_balcony, value: String(content?.no_of_balcony ?? '') },
      landNo: content?.land_no,
      unitUsage: { key: content?.unit_usage, value: content?.unit_usage },
      unitType: { key: content?.unit_type, value: content?.unit_type },
      subType: content?.sub_type,
      makaniNo: content?.makani_no,
      dewaNo: content?.dewa_no,
    };
  }

  patchUnitCommercialsDetails(response: any) {
    const content: any = response.content;
    return {
      rent: content?.rent,
      securityDeposit: content?.security_deposit,
      bookingAmount: content?.booking_amount,
      maintenanceCharges: content?.maintenance_charges,
      cycle: content?.cycle,
      noticePeriod: content?.notice_period,
      commissionPercent: content?.commission_percent,
    };
  }

  patchUnitImages(response: any) {
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

  patchUnitDocuments(response: any) {
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

  mapOutUnitBasicDetails(value: any): Record<string, any> {
    const unitOwners = (value.unitOwners || [])
      .filter((o: any) => o.ownerEmail)
      .map((o: any) => ({
        owner_name: o.ownerName,
        email: o.ownerEmail,
        contact_number: o.ownerContact,
        emirates_id: o.ownerEmiratesId,
        owner_number: o.ownerNumber || null,
        trade_license_number: o.tradeLicenseNumber || null,
        license_number: o.licenseNumber || null,
        license_expiry_date: o.licenseExpiryDate || null,
        license_issuer: o.licenseIssuer || null,
        fax_number: o.faxNumber || null,
        po_box_number: o.poBoxNumber || null,
      }));

    return {
      unit_owners: unitOwners,
      block_id: value.blockId?.key ?? value.blockId,
      unit_name: value.unitName,
      unit_size: value.unitSize || null,
      area: value.area || null,
      dm_no: value.dmNo || null,
      no_of_bedrooms: (value.noOfBedrooms?.key ?? value.noOfBedrooms) || null,
      floor_no: (value.floorNo?.key ?? value.floorNo) || null,
      parking_no: value.parkingNo || null,
      no_of_balcony: (value.noOfBalcony?.key ?? value.noOfBalcony) || null,
      land_no: value.landNo || null,
      unit_usage: (value.unitUsage?.key ?? value.unitUsage) || null,
      unit_type: (value.unitType?.key ?? value.unitType) || null,
      sub_type: value.subType || null,
      makani_no: value.makaniNo || null,
      dewa_no: value.dewaNo || null,
    };
  }

  mapOutUnitCommercialsDetails(value: any): Record<string, any> {
    return {
      rent: value.rent || null,
      security_deposit: value.securityDeposit || null,
      booking_amount: value.bookingAmount || null,
      maintenance_charges: value.maintenanceCharges || null,
      cycle: value.cycle || null,
      notice_period: value.noticePeriod || null,
      commission_percent: value.commissionPercent || null,
    };
  }

  mapOutUnitImages(value: any): Record<string, any> {
    const images = (value.images || [])
      .filter((i: any) => !i?.backendId)
      .map((i: any) => ({
        data: i.base64,
        file_name: i.file_name,
        type: i.type,
      }));
    return { images };
  }

  mapOutUnitDocuments(value: any): Record<string, any> {
    const documents = (value.documents || [])
      .filter((i: any) => !i?.backendId)
      .map((i: any) => ({
        data: i.base64,
        file_name: i.file_name,
        document_type_id: i.type,
      }));
    return { documents };
  }
}
