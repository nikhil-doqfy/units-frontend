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
import { Subject, takeUntil } from 'rxjs';
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

type UploadImageType =
  | 'INTERIOR'
  | 'EXTERIOR'
  | 'FLOOR_PLAN_DOCUMENT'
  | 'TENANT_DOCUMENT'
  | 'EJARI_CERTIFICATE'
  | 'PMC_DOCUMENT'
  | 'CHEQUE_DOCUMENT';

type FormKey = 'images' | 'documents';

interface UploadConfig {
  form: FormGroup;
  formKey: FormKey;
}

type UploadConfigRecord = Record<UploadImageType, UploadConfig>;

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
  country: any[] = [];
  state: any[] = [];
  city: any[] = [];

  basicDetailsForm = this.propertyFormService.propertyBasicDetailsForm;
  commercialsForm = this.propertyFormService.propertyCommercialsForm;
  imagesForm = this.propertyFormService.propertyImagesForm;
  documentationForm = this.propertyFormService.propertyDocumentationForm;

  engine!: StepEngine;
  steps: StepSchema[] = [];

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
    this.themeService.currentRole$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((role) => {
        this.currentRole = role;
        if (role === 'owner') {
          options.push({
            param: 'OWNER_COMPANY_USER',
            key: 'company_user',
            setter: (v) => {
              this.PMC_List = v;
            },
          });
        }
      });

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
      }
    );

    this.getOptionsTypes(options);
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
        console.log('basicDetailsForm:--', this.basicDetailsForm.value);
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

  getUploadConfig(type: UploadImageType): UploadConfig {
    const uploadConfig: UploadConfigRecord = {
      EXTERIOR: {
        form: this.imagesForm,
        formKey: 'images',
      },
      INTERIOR: {
        form: this.imagesForm,
        formKey: 'images',
      },

      FLOOR_PLAN_DOCUMENT: {
        form: this.documentationForm,
        formKey: 'documents',
      },
      TENANT_DOCUMENT: {
        form: this.documentationForm,
        formKey: 'documents',
      },
      EJARI_CERTIFICATE: {
        form: this.documentationForm,
        formKey: 'documents',
      },
      PMC_DOCUMENT: {
        form: this.documentationForm,
        formKey: 'documents',
      },
      CHEQUE_DOCUMENT: {
        form: this.documentationForm,
        formKey: 'documents',
      },
    };

    return uploadConfig[type];
  }

  onUpload(type: UploadImageType, event: UploadFileModel) {
    this.handleUploadEvent(type, event);
  }

  private handleUploadEvent(type: UploadImageType, event: UploadFileModel) {
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

  remove(type: UploadImageType, item: any) {
    if (item?.backendId) {
      this.removeItem(type, item?.backendId, true);
    } else {
      this.removeItem(type, item.id);
    }
  }

  removeItem(type: UploadImageType, id: number, isBackend = false) {
    const cfg = this.getUploadConfig(type);
    const form = cfg.form;
    const key = cfg.formKey;

    console.log(form.value[key]);

    const filtered = isBackend
      ? (form.value[key] || []).filter((x: any) => x.backendId !== id)
      : (form.value[key] || []).filter((x: any) => x.id !== id);

    form.patchValue({ [key]: filtered });
  }

  getItems(type: UploadImageType) {
    const cfg = this.getUploadConfig(type);
    const form = cfg.form;
    const key = cfg.formKey;

    return (form.value[key] || []).filter((x: any) => x.type === type);
  }
}
