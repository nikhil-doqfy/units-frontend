import { Component, inject, OnInit } from '@angular/core';
import { UploadFileModel } from '../../../shared/model/shared.model';
import { SharedService } from '../../../shared.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StepFormLayoutComponent } from '../../component/step-form-layout/step-form-layout.component';
import { StepPaneComponent } from '../../component/step-form-layout/step-pane.component';
import { FormService } from '../../../shared/services/form.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StepEngine } from '../../model/step-engine/step-engine';
import { StepSchema } from '../../model/step-engine/step-schema';
import { CommonModule } from '@angular/common';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UploadDocumentComponent } from '../../component/upload-document/upload-document.component';
import { FileUploadItemComponent } from '../../component/file-upload-item/file-upload-item.component';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { FormSelectFieldComponent } from '../../../shared/component/form-select-field/form-select-field.component';
import { UnitFormService } from '../../services/unit-form.service';
import { PropertyService } from '../../services/property.service';
import { SharedApiService } from '../../../shared/services/shared-api.service';
import { filter, take } from 'rxjs';

type FormKey = 'images' | 'documents';

interface UplodTypeModal {
  typeKey: string;
  typeLabel: string;
  formKey: FormKey;
}

interface UploadConfig {
  form: FormGroup;
  formKey: FormKey;
}

@Component({
  selector: 'app-new-units',
  standalone: true,
  imports: [
    StepFormLayoutComponent,
    StepPaneComponent,
    CommonModule,
    CustomSelectComponent,
    FormSelectFieldComponent,
    UploadDocumentComponent,
    ReactiveFormsModule,
    FileUploadItemComponent,
    TranslateModule,
  ],
  templateUrl: './new-units.component.html',
  styleUrl: './new-units.component.css',
})
export class NewUnitsComponent implements OnInit {
  private unitFormService = inject(UnitFormService);
  private propertyService = inject(PropertyService);
  private sharedApiService = inject(SharedApiService);
  private formService = inject(FormService);
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);

  isInvalid = this.formService.isInvalid;

  propertyList: any[] = [];
  blockList: any[] = [];
  ownerList: any[] = [];

  // Hardcoded dropdown options
  unitUsageList = [
    { key: 'RESIDENTIAL', value: 'Residential' },
    { key: 'COMMERCIAL', value: 'Commercial' },
  ];
  unitTypeList = [
    { key: 'FLAT', value: 'Flat' },
    { key: 'APARTMENT', value: 'Apartment' },
    { key: 'VILLA', value: 'Villa' },
  ];
  bedroomList = Array.from({ length: 10 }, (_, i) => ({
    key: i + 1,
    value: String(i + 1),
  }));
  floorList = Array.from({ length: 51 }, (_, i) => ({
    key: i,
    value: String(i),
  }));
  balconyList = Array.from({ length: 11 }, (_, i) => ({
    key: i,
    value: String(i),
  }));

  breadcrumbData = [
    {
      label: this.translate.instant('PAGE_TITLE.DASHBOARD'),
      link: '/dashboard/home',
    },
    {
      label: this.translate.instant('PAGE_TITLE.PROPERTIES'),
      link: '/dashboard/properties',
    },
    { label: this.translate.instant('PAGE_TITLE.NEW_UNITS'), link: '' },
  ];
  basicDetailsForm = this.unitFormService.unitBasicDetailsForm;
  commercialsForm = this.unitFormService.unitCommercialsForm;
  imagesForm = this.unitFormService.unitImagesForm;
  documentationForm = this.unitFormService.unitDocumentationForm;

  engine!: StepEngine;
  steps: StepSchema[] = [];

  imageUploadTypes: UplodTypeModal[] = [
    { typeKey: 'INTERIOR', typeLabel: 'Interior', formKey: 'images' },
    { typeKey: 'EXTERIOR', typeLabel: 'Exterior', formKey: 'images' },
  ];
  documetUploadTypes: UplodTypeModal[] = [];
  activeImageTab = 'INTERIOR';
  activeDocTab: any = null;
  uploadIdCounter = { images: 1, documents: 1 };

  constructor(
    private router: Router,
    private translate: TranslateService,
  ) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);

    this.steps = this.unitFormService.buildUnitSteps();
    this.engine = new StepEngine(this.steps);
    this.unitFormService.setEngine(this.engine);

    const formId = this.route.snapshot.paramMap.get('id');
    if (formId) {
      this.engine.setFormId(+formId);
      this.steps.forEach((step) => {
        this.engine.setStepFormMode(step.id, 'EDIT');
        this.engine.setStepStatus(step.id, 'ONGOING');
      });
      this.engine.loadStep(0);
    }
  }

  ngOnInit() {
    this.loadProperties();
    this.loadDocumentTypes();
    this.sharedApiService.getOptionsType([
      { param: 'PMC_OWNERS', key: 'pmc_owners', setter: (v) => (this.ownerList = v) },
    ]);

    // In edit mode, auto-load blocks when property is pre-populated via patchValue
    if (this.route.snapshot.paramMap.get('id')) {
      this.basicDetailsForm.get('property')?.valueChanges
        .pipe(filter((v) => !!v?.key), take(1))
        .subscribe((prop) => {
          this.propertyService.getPropertyBlocks({ property_id: prop.key }).subscribe({
            next: (resp: any) => {
              this.blockList = (resp?.content || []).map((b: any) => ({
                key: b.id,
                value: b.block_name,
              }));
            },
          });
        });
    }
  }

  loadDocumentTypes() {
    this.propertyService.getUnitDocumentTypes().subscribe({
      next: (resp: any) => {
        const types = resp?.content || [];
        this.documetUploadTypes = types.map((dt: any) => ({
          typeKey: dt.id,
          typeLabel: dt.name,
          formKey: 'documents' as FormKey,
        }));
        this.activeDocTab = types[0]?.id ?? null;
      },
    });
  }

  loadProperties() {
    this.propertyService.getProperties().subscribe({
      next: (resp: any) => {
        this.propertyList = (resp?.content || []).map((p: any) => ({
          key: p.id,
          value: p.property_name,
        }));
      },
    });
  }

  onPropertySelect(data: any) {
    if (typeof data?.key !== 'number') return;
    this.blockList = [];
    this.basicDetailsForm.patchValue({ blockId: '' });
    this.propertyService
      .getPropertyBlocks({ property_id: data.key })
      .subscribe({
        next: (resp: any) => {
          this.blockList = (resp?.content || []).map((b: any) => ({
            key: b.id,
            value: b.block_name,
          }));
        },
      });
  }

  // Owner management
  get ownerForms(): FormArray {
    return this.unitFormService.unitOwnersArray;
  }

  addOwner(): void {
    this.ownerForms.push(this.unitFormService.createOwnerGroup());
  }

  removeOwner(index: number): void {
    if (this.ownerForms.length > 1) {
      this.ownerForms.removeAt(index);
    }
  }

  onOwnerCodeSelect(owner: any, index: number): void {
    if (!owner) return;
    this.ownerForms.at(index).patchValue({
      ownerName: owner.name ?? '',
      ownerEmail: owner.email ?? '',
      ownerContact: owner.contact_number ?? '',
      ownerEmiratesId: owner.emirates_id ?? '',
      ownerNumber: owner.owner_number ?? '',
      tradeLicenseNumber: owner.trade_license_number ?? '',
      licenseNumber: owner.license_number ?? '',
      licenseExpiryDate: owner.license_expiry_date ?? '',
      licenseIssuer: owner.license_issuer ?? '',
      faxNumber: owner.fax_number ?? '',
      poBoxNumber: owner.po_box_number ?? '',
    });
  }

  fillDummyData(): void {
    this.basicDetailsForm.patchValue({
      unitName: 'Unit A-101',
      unitSize: 1200,
      area: '120',
      dmNo: 'DM-12345',
      noOfBedrooms: { key: 2, value: '2' },
      floorNo: { key: 5, value: '5' },
      parkingNo: 'P-02',
      noOfBalcony: { key: 1, value: '1' },
      landNo: 'PLT-001',
      unitUsage: { key: 'RESIDENTIAL', value: 'Residential' },
      unitType: { key: 'APARTMENT', value: 'Apartment' },
      subType: '2BHK',
      makaniNo: '20437733',
      dewaNo: '9988776655',
    });
    this.commercialsForm.patchValue({
      rent: 80000,
      securityDeposit: 10000,
      bookingAmount: 5000,
      maintenanceCharges: 2000,
      cycle: 12,
      noticePeriod: 3,
      commissionPercent: 5,
    });
    this.ownerForms.at(0).patchValue({
      ownerName: 'John Doe',
      ownerEmail: 'john.doe@example.com',
      ownerContact: '+971501234567',
      ownerEmiratesId: '784-1990-1234567-1',
    });
  }

  submitUnit(): void {
    this.router.navigate(['/dashboard/properties'], {
      queryParams: { tab: 'units' },
    });
  }

  getUploadConfig(type: string): UploadConfig {
    const all: UplodTypeModal[] = [
      ...this.imageUploadTypes,
      ...this.documetUploadTypes,
    ];
    const cfg = all.find((m) => m.typeKey === type);
    if (!cfg) throw new Error('Invalid type');
    return {
      form:
        cfg.formKey === 'documents' ? this.documentationForm : this.imagesForm,
      formKey: cfg.formKey,
    };
  }

  onUpload(type: string, event: UploadFileModel) {
    const { form, formKey } = this.getUploadConfig(type);
    const items = [...(form.value[formKey] || [])];
    const index = items.findIndex((x) => x.tempId === event.tempId);
    const counterKey = formKey === 'images' ? 'images' : 'documents';
    const payload = {
      id: index === -1 ? this.uploadIdCounter[counterKey]++ : items[index].id,
      tempId: event.tempId,
      file_name: event.file.name,
      file: event.file,
      base64: event.base64,
      status: event.status ?? 'uploading',
      progress: event.progress ?? 0,
      type,
    };
    if (index === -1) items.push(payload);
    else items[index] = { ...items[index], ...payload };
    form.patchValue({ [formKey]: items });
  }

  remove(type: string, item: any) {
    if (item?.backendId) this.removeItem(type, item.backendId, true);
    else this.removeItem(type, item.id);
  }

  removeItem(type: string, id: number, isBackend = false) {
    const { form, formKey } = this.getUploadConfig(type);
    const filtered = isBackend
      ? (form.value[formKey] || []).filter((x: any) => x.backendId !== id)
      : (form.value[formKey] || []).filter((x: any) => x.id !== id);
    form.patchValue({ [formKey]: filtered });
  }

  getItems(type: string) {
    const { form, formKey } = this.getUploadConfig(type);
    return (form.value[formKey] || []).filter((x: any) => x.type === type);
  }
}
