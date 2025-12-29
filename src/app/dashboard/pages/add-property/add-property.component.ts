import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeService, UserRole } from '../../../theme.service';

import { StepFormLayoutComponent } from '../../component/step-form-layout/step-form-layout.component';
import { StepPaneComponent } from '../../component/step-form-layout/step-pane.component';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { UploadDocumentComponent } from '../../component/upload-document/upload-document.component';
import { PropertyFormService } from '../../services/property-form.service';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SharedApiService } from '../../../shared/services/shared-api.service';
import { FormService } from '../../../shared/services/form.service';
import { TranslateModule } from '@ngx-translate/core';
import { SharedService } from '../../../shared.service';
import {
  OptionsParams,
  UploadFileModel,
} from '../../../shared/model/shared.model';
import { FileUploadItemComponent } from '../../component/file-upload-item/file-upload-item.component';
import { StepSchema } from '../../model/step-engine/step-schema';
import { StepEngine } from '../../model/step-engine/step-engine';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PropertyService } from '../../services/property.service';

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
    UploadDocumentComponent,
    ReactiveFormsModule,
    FileUploadItemComponent,
    TranslateModule,
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
  private destroyRef = inject(DestroyRef);
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Properties', link: '/dashboard/properties' },
    { label: 'Add Property', link: '' },
  ];

  currentRole: UserRole = 'owner';
  isInvalid = this.formService.isInvalid;
  propertyList: any[] = [];
  propertyType: any[] = [];
  PMC_List: any[] = [];
  ownerList: any[] = [];
  country: any[] = [];
  state: any[] = [];
  city: any[] = [];

  basicDetailsForm = this.propertyFormService.propertyBasicDetailsForm;
  commercialsForm = this.propertyFormService.propertyCommercialsForm;
  imagesForm = this.propertyFormService.propertyImagesForm;
  documentationForm = this.propertyFormService.propertyDocumentationForm;

  engine!: StepEngine;
  steps: StepSchema[] = [];

  imageUploadTypes: UplodTypeModal[] = [];
  documetUploadTypes: UplodTypeModal[] = [];
  activeImageTab!: string;
  activeDocTab!: string;
  uploadIdCounter = {
    images: 1,
    documents: 1,
  };

  constructor(private router: Router, private themeService: ThemeService) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);

    this.steps = this.propertyFormService.buildPropertySteps();
    this.engine = new StepEngine(this.steps);
    this.propertyFormService.setEngine(this.engine);

    const formId = this.route.snapshot.paramMap.get('id');
    if (formId) {
      this.engine.setFormId(+formId);
      this.engine.loadStep(0);
    }
  }

  ngOnInit() {
    let options: OptionsParams[] = [];
    this.currentRole = this.themeService.getRole();

    if (this.currentRole === 'owner') {
      options.push({
        param: 'OWNER_COMPANY_USER',
        key: 'company_user',
        setter: (v) => {
          this.PMC_List = v;
        },
      });
    }

    if (this.currentRole === 'property-manager') {
      options.push({
        param: 'OWNER_DETAILS',
        key: 'owners',
        setter: (v) => {
          this.ownerList = v;
        },
      });
    }

    options.push(
      {
        param: 'PARENT_PROPERTY',
        key: 'property',
        setter: (v) => {
          this.propertyList = v;
        },
      },
      {
        param: 'PROPERTY_TYPE',
        key: 'property_type',
        setter: (v) => {
          this.propertyType = v;
        },
      },
      {
        param: 'COUNTRY',
        key: 'country',
        setter: (v) => {
          this.country = v;
        },
      },
      {
        param: 'PROPERTY_DOCUMENT_CHOICE',
        key: 'Property_Document',
        setter: (v) => {
          this.documetUploadTypes = this.getProcessUploadTypes(v, 'documents');
          this.activeDocTab = v[0]?.key;
        },
      },
      {
        param: 'PROPERTY_IMAGE_CHOICE',
        key: 'Property_Image',
        setter: (v) => {
          this.imageUploadTypes = this.getProcessUploadTypes(v, 'images');
          this.activeImageTab = v[0]?.key;
        },
      }
    );

    this.getOptionsTypes(options);
  }

  getProcessUploadTypes(data: any, formKey: FormKey): UplodTypeModal[] {
    const types = data.map((item: any) => ({
      typeKey: item.key,
      typeLabel: item.value,
      formKey,
    }));
    return types;
  }

  getOptionsTypes(option: OptionsParams[]) {
    this.sharedAPIService.getOptionsType(option);
  }

  onPropertySelect(data: any) {
    if (typeof data?.key !== 'number') return;

    this.propertyService.getParentPropertyData({ id: data.key }).subscribe({
      next: (response: any) => {
        let content = response?.content;
        this.basicDetailsForm.patchValue({
          NoOfFloors: content?.total_floors,
          addressLine2: content?.addressLine2,
          locality: content?.locality,
          postalCode: content?.postal_code,
          propertyType: content?.property_type,
          country: content?.country,
          state: content?.state,
          city: content?.city,
        });
      },
    });
  }

  onCountrySelect(data: any) {
    this.getOptionsTypes([
      {
        param: 'STATE',
        params: { country_id: data.key },
        key: 'state',
        setter: (v) => {
          this.state = v;
        },
      },
    ]);
  }

  onStateSelect(data: any) {
    this.getOptionsTypes([
      {
        param: 'CITY',
        params: { state_id: data.key },
        key: 'city',
        setter: (v) => {
          this.city = v;
        },
      },
    ]);
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
      this.removeItem(type, item?.backendId, true);
    } else {
      this.removeItem(type, item.id);
    }
  }

  removeItem(type: string, id: number, isBackend = false) {
    const cfg = this.getUploadConfig(type);
    const form = cfg.form;
    const key = cfg.formKey;

    console.log(form.value[key]);

    const filtered = isBackend
      ? (form.value[key] || []).filter((x: any) => x.backendId !== id)
      : (form.value[key] || []).filter((x: any) => x.id !== id);

    form.patchValue({ [key]: filtered });
  }

  getItems(type: string) {
    const cfg = this.getUploadConfig(type);
    const form = cfg.form;
    const key = cfg.formKey;

    return (form.value[key] || []).filter((x: any) => x.type === type);
  }
}
