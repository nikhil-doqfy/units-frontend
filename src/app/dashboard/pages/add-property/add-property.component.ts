import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { StepFormLayoutComponent } from '../../component/step-form-layout/step-form-layout.component';
import { StepPaneComponent } from '../../component/step-form-layout/step-pane.component';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { FormSelectFieldComponent } from '../../../shared/component/form-select-field/form-select-field.component';
import { UploadDocumentComponent } from '../../component/upload-document/upload-document.component';
import { PropertyFormService } from '../../services/property-form.service';
import { PropertyService } from '../../services/property.service';
import {
  FormArray,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { SharedApiService } from '../../../shared/services/shared-api.service';
import { FormService } from '../../../shared/services/form.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../shared.service';
import {
  OptionsParams,
  UploadFileModel,
} from '../../../shared/model/shared.model';
import { FileUploadItemComponent } from '../../component/file-upload-item/file-upload-item.component';
import { StepSchema } from '../../model/step-engine/step-schema';
import { StepEngine } from '../../model/step-engine/step-engine';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import {
  MapPickerComponent,
  MapLocation,
} from '../../component/map-picker/map-picker.component';

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
  selector: 'app-add-property',
  standalone: true,
  imports: [
    CommonModule,
    StepFormLayoutComponent,
    StepPaneComponent,
    CustomSelectComponent,
    FormSelectFieldComponent,
    UploadDocumentComponent,
    ReactiveFormsModule,
    FileUploadItemComponent,
    TranslateModule,
    WhiteCardComponent,
    MapPickerComponent,
    FormsModule,
  ],
  templateUrl: './add-property.component.html',
  styleUrl: './add-property.component.css',
})
export class AddPropertyComponent {
  private propertyFormService = inject(PropertyFormService);
  private propertyService = inject(PropertyService);
  private sharedAPIService = inject(SharedApiService);
  private formService = inject(FormService);
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  breadcrumbData = [
    {
      label: this.translate.instant('PAGE_TITLE.DASHBOARD'),
      link: '/dashboard/home',
    },
    {
      label: this.translate.instant('PAGE_TITLE.PROPERTIES'),
      link: '/dashboard/properties',
    },
    { label: this.translate.instant('PAGE_TITLE.ADD_PROPERTY'), link: '' },
  ];

  isInvalid = this.formService.isInvalid;
  propertyType: any[] = [];
  blocksCount: any[] = [];
  unitsCount: any[] = [];
  areaUnit: any[] = [];
  floorsCount: any[] = [];
  parkingCount: any[] = [];
  pmcList: any[] = [];
  selectedPmc: any = null;
  selectedPlatform: any = null;
  filterPlatform: string | null = null;

  commercialsForm = this.propertyFormService.propertyCommercialsForm;
  imagesForm = this.propertyFormService.propertyImagesForm;
  documentationForm = this.propertyFormService.propertyDocumentationForm;
  pmDetailsForm = this.propertyFormService.propertyManagerDetailsForm;
  blocksForm = this.propertyFormService.propertyBlocksForm;

  engine!: StepEngine;
  steps: StepSchema[] = [];

  platformOptions = [
    { key: 'BAYUT', value: 'Bayut' },
    { key: 'PROPERTY_FINDER', value: 'Property Finder' },
    { key: 'DIRECT', value: 'Direct' },
    { key: 'REFERRAL', value: 'Referral' },
  ];
  blocksBulkColumns = [
    { key: 'block_name', label: 'Block/Tower Name' },
    { key: 'no_of_floors', label: 'No of Floors' },
    { key: 'no_of_parking', label: 'No of Parking' },
    { key: 'no_of_units', label: 'No of Units' },
  ];

  imageUploadTypes: UplodTypeModal[] = [];
  documetUploadTypes: UplodTypeModal[] = [];
  activeImageTab!: string;
  activeDocTab!: string;
  uploadIdCounter = {
    images: 1,
    documents: 1,
  };

  constructor(
    private router: Router,
    private translate: TranslateService,
  ) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);

    this.steps =
      this.propertyFormService.buildPropertySteps('property-manager');
    this.engine = new StepEngine(this.steps);
    this.propertyFormService.setEngine(this.engine);

    const formId = this.route.snapshot.paramMap.get('id');
    if (formId) {
      this.engine.setFormId(+formId);
      // Mark all steps EDIT + ONGOING so data loads when each step is visited
      this.steps.forEach((step) => {
        this.engine.setStepFormMode(step.id, 'EDIT');
        this.engine.setStepStatus(step.id, 'ONGOING');
      });
      this.engine.loadStep(0);
    }
  }

  ngOnInit() {
    this.sharedService.initLanguage();
    this.blockForms.valueChanges.subscribe(() => {
      this.updateCounts();
    });

    this.updateCounts();
    const options: OptionsParams[] = [
      {
        param: 'PROPERTY_TYPE',
        key: 'property_type',
        setter: (v) => {
          this.propertyType = v;
        },
      },
      {
        param: 'BLOCKS_COUNT',
        key: 'blocks_count',
        setter: (v) => {
          this.blocksCount = v;
        },
      },
      {
        param: 'UNITS_COUNT',
        key: 'units_count',
        setter: (v) => {
          this.unitsCount = v;
        },
      },
      {
        param: 'AREA_UNIT',
        key: 'area_unit',
        setter: (v) => {
          this.areaUnit = v;
        },
      },
      {
        param: 'FLOOR_COUNT',
        key: 'floor_count',
        setter: (v) => {
          this.floorsCount = v;
        },
      },
      {
        param: 'PARKING_COUNT',
        key: 'parking_count',
        setter: (v) => {
          this.parkingCount = v;
        },
      },
      {
        param: 'PROPERTY_IMAGE_CHOICE',
        key: 'Property_Image',
        setter: (v) => {
          this.imageUploadTypes = this.getProcessUploadTypes(v, 'images');
          this.activeImageTab = v[0]?.key;
        },
      },
    ];

    this.sharedAPIService.getOptionsType(options);

    this.sharedAPIService
      .getOptions({ option_type: 'PMC_BY_PM' })
      .subscribe((resp: any) => {
        this.pmcList = resp?.content?.pmc ?? [];

        const existing = this.pmDetailsForm.get('pmc')?.value;
        if (existing?.key) {
          this.selectedPmc =
            this.pmcList.find((p: any) => p.key === existing.key) ?? existing;
        }
      });

    this.propertyService.getPropertyDocumentTypes().subscribe((resp: any) => {
      const types = resp?.content || [];
      this.documetUploadTypes = types.map((dt: any) => ({
        typeKey: dt.id,
        typeLabel: dt.name,
        formKey: 'documents' as FormKey,
      }));
      this.activeDocTab = types[0]?.id;
    });
  }

  getProcessUploadTypes(data: any, formKey: FormKey): UplodTypeModal[] {
    return data.map((item: any) => ({
      typeKey: item.key,
      typeLabel: item.value,
      formKey,
    }));
  }

  get blockForms(): FormArray {
    return this.blocksForm.get('blocks') as FormArray;
  }

  addBlock(): void {
    this.blockForms.push(this.propertyFormService.createBlockGroup());
    this.updateCounts();
  }

  removeBlock(index: number): void {
    if (this.blockForms.length > 1) {
      this.blockForms.removeAt(index);
      this.updateCounts();
    }
  }

  onBlocksBulkImport(rows: any[]): void {
    while (this.blockForms.length > 0) this.blockForms.removeAt(0);
    rows.forEach((row) => {
      const group = this.propertyFormService.createBlockGroup();
      group.patchValue({
        blockName: row['block_name'] ?? '',
        noOfFloors:
          row['no_of_floors'] != null
            ? { key: +row['no_of_floors'], value: String(row['no_of_floors']) }
            : '',
        noOfParking:
          row['no_of_parking'] != null
            ? {
                key: +row['no_of_parking'],
                value: String(row['no_of_parking']),
              }
            : '',
        noOfUnits:
          row['no_of_units'] != null
            ? { key: +row['no_of_units'], value: String(row['no_of_units']) }
            : '',
      });
      this.blockForms.push(group);
    });
  }

  onMapLocationSelected(location: MapLocation): void {
    this.pmDetailsForm.patchValue({
      latitude: location.latitude,
      longitude: location.longitude,
      mapAddress: location.address,
    });
  }

  onPmcSelected(option: any): void {
    this.selectedPmc = option;
    this.pmDetailsForm.patchValue({ pmc: option });
  }

  submitProperty(): void {
    this.router.navigate(['dashboard/properties']);
  }

  getUploadConfig(type: string): UploadConfig {
    const combineTypeModal: UplodTypeModal[] = [
      ...this.imageUploadTypes,
      ...this.documetUploadTypes,
    ];
    const cfg = combineTypeModal.find((modal) => modal.typeKey === type);
    if (!cfg) throw new Error('Invalid Type');
    return {
      form:
        cfg.formKey === 'documents' ? this.documentationForm : this.imagesForm,
      formKey: cfg.formKey,
    };
  }

  onUpload(type: string, event: UploadFileModel) {
    this.handleUploadEvent(type, event);
  }

  private handleUploadEvent(type: string, event: UploadFileModel) {
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
    if (item?.backendId) {
      const cfg = this.getUploadConfig(type);
      if (cfg.formKey === 'documents') {
        this.propertyService.deletePropertyDocument(item.backendId).subscribe();
      } else {
        this.propertyService.deletePropertyImage(item.backendId).subscribe();
      }
      this.removeItem(type, item.backendId, true);
    } else {
      this.removeItem(type, item.id);
    }
  }

  removeItem(type: string, id: number, isBackend = false) {
    const cfg = this.getUploadConfig(type);
    const form = cfg.form;
    const key = cfg.formKey;

    const filtered = isBackend
      ? (form.value[key] || []).filter((x: any) => x.backendId !== id)
      : (form.value[key] || []).filter((x: any) => x.id !== id);

    form.patchValue({ [key]: filtered });
  }

  getItems(type: string) {
    const cfg = this.getUploadConfig(type);
    return (cfg.form.value[cfg.formKey] || []).filter(
      (x: any) => x.type === type,
    );
  }
  /*-----totalUnit and block-------------*/
  blockCount = 0;
  unitCount = 0;

  getPageTitle() {
    return `
    ${this.translate.instant('TOTAL_BLOCKS_TOWERS')}
    <span class="blockCount">${this.blockCount}</span>
    ${this.translate.instant('TOTAL_UNITS')}
    <span class="unitCount">${this.unitCount}</span>
  `;
  }
  updateCounts(): void {
    this.blockCount = this.blockForms.length;

    this.unitCount = this.blockForms.controls.reduce(
      (total: number, block: any) => {
        const units = block.get('noOfUnits')?.value;

        return total + (units?.key || 0);
      },
      0,
    );
  }
}
