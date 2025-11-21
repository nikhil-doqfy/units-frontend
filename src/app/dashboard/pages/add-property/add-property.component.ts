import { Component, inject } from '@angular/core';
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
import { UploadFileModel } from '../../../shared/model/shared.model';
import { FileUploadItemComponent } from '../../component/file-upload-item/file-upload-item.component';

type UploadImageType =
  | 'interior'
  | 'exterior'
  | 'floor_plan_documents'
  | 'tenant_documents'
  | 'ejari_certificates'
  | 'pmc_documents'
  | 'cheque_documents';

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
  private sharedAPIService = inject(SharedApiService);
  private formService = inject(FormService);
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Properties', link: '/dashboard/properties' },
    { label: 'Add Property', link: '' },
  ];

  currentRole: UserRole = 'owner';

  basicDetailsForm = this.propertyFormService.propertyBasicDetailsForm;
  commercialsForm = this.propertyFormService.propertyCommercialsForm;
  imagesForm = this.propertyFormService.propertyImagesForm;
  documentationForm = this.propertyFormService.propertyDocumentationForm;

  isInvalid = this.formService.isInvalid;

  propertyType: any[] = [];
  PMC_List: any[] = [];

  exteriorImages: UploadFileModel[] = [];
  interiorImages: UploadFileModel[] = [];
  propertyFloorPlanImages: UploadFileModel[] = [];
  tenantDocImages: UploadFileModel[] = [];
  ejariCertificateImages: UploadFileModel[] = [];
  pmcDocsImages: UploadFileModel[] = [];
  checkImages: UploadFileModel[] = [];

  private uploadConfig = {
    exterior: {
      list: this.exteriorImages,
      form: this.imagesForm,
      formKey: 'images',
    },
    interior: {
      list: this.interiorImages,
      form: this.imagesForm,
      formKey: 'images',
    },

    floor_plan_documents: {
      list: this.propertyFloorPlanImages,
      form: this.documentationForm,
      formKey: 'documents',
    },
    tenant_documents: {
      list: this.tenantDocImages,
      form: this.documentationForm,
      formKey: 'documents',
    },
    ejari_certificates: {
      list: this.ejariCertificateImages,
      form: this.documentationForm,
      formKey: 'documents',
    },
    pmc_documents: {
      list: this.pmcDocsImages,
      form: this.documentationForm,
      formKey: 'documents',
    },
    cheque_documents: {
      list: this.checkImages,
      form: this.documentationForm,
      formKey: 'documents',
    },
  };

  uploadIdCounter = 1;

  private destroy$ = new Subject<void>();

  constructor(private router: Router, private themeService: ThemeService) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
  }

  ngOnInit() {
    this.themeService.currentRole$
      .pipe(takeUntil(this.destroy$))
      .subscribe((role) => {
        this.currentRole = role;
      });

    this.getOptionType(['PROPERTY_TYPES', 'PMC_LIST']);
  }

  getOptionType(options: string[]) {
    this.sharedAPIService
      .getOptions({ option_type: options.join(',') })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.propertyType = response?.content?.property_types;
          this.PMC_List = response?.content?.pmc_list;
        },
      });
  }

  submitProperty(): void {
    console.log('Final Step Completed — Submitting Property...');
    // Call API or navigate
    this.router.navigate(['dashboard/properties']);
  }

  onUpload(type: UploadImageType, event: UploadFileModel) {
    this.handleUploadEvent(type, event);
  }

  private handleUploadEvent(type: UploadImageType, event: UploadFileModel) {
    const cfg = this.uploadConfig[type];
    const list = cfg.list;

    const existing = list.find((x) => x.tempId === event.tempId);

    if (!existing) {
      const model = { ...event, id: this.uploadIdCounter++, type };
      list.push(model);
      return;
    }

    Object.assign(existing, event);

    if (event.progress === 100) {
      this.syncToForm(type, existing);
    }
  }

  private syncToForm(type: UploadImageType, file: UploadFileModel) {
    const cfg = this.uploadConfig[type];
    const form = cfg.form;
    const formKey = cfg.formKey;

    let items = form.value[formKey] || [];

    const payload = {
      id: file.id,
      file_name: file.file.name,
      type,
      data: file.base64,
    };

    const index = items.findIndex((x: any) => x.id === file.id);

    if (index === -1) items.push(payload);
    else items[index] = payload;

    form.patchValue({ [formKey]: items });
  }

  remove(type: UploadImageType, id: number | undefined) {
    const cfg = this.uploadConfig[type];

    // 1. Remove from UI list
    cfg.list = cfg.list.filter((item) => item.id !== id);

    // 2. Remove from correct form + correct control
    const form = cfg.form;
    const formKey = cfg.formKey;
    const updated = (form.value[formKey] || []).filter((x: any) => x.id !== id);

    form.patchValue({ [formKey]: updated });
  }

  // onExteriorImageUploadProgress(event: UploadFileModel) {
  //   this.handleUploadEvent(event, this.exteriorImages, 'exterior');
  // }

  // onInteriorImageUploadProgress(event: UploadFileModel) {
  //   this.handleUploadEvent(event, this.interiorImages, 'interior');
  // }

  // onPropertyPlanUploadProgress(event: UploadFileModel) {
  //   this.handleUploadEvent(
  //     event,
  //     this.propertyFloorPlanImages,
  //     'floor_plan_documents'
  //   );
  // }

  // onTenantDocsUploadProgress(event: UploadFileModel) {
  //   this.handleUploadEvent(event, this.tenantDocImages, 'tenant_documents');
  // }

  // onEjariCersUploadProgress(event: UploadFileModel) {
  //   this.handleUploadEvent(
  //     event,
  //     this.ejariCertificateImages,
  //     'ejari_certificates'
  //   );
  // }

  // onPmcDocUploadProgress(event: UploadFileModel) {
  //   this.handleUploadEvent(event, this.pmcDocsImages, 'pmc_documents');
  // }

  // onCheckUploadProgress(event: UploadFileModel) {
  //   this.handleUploadEvent(event, this.checkImages, 'cheque_documents');
  // }

  // private handleUploadEvent(
  //   event: UploadFileModel,
  //   list: UploadFileModel[],
  //   type: UploadImageType
  // ) {
  //   const existing = list.find((item) => item.tempId === event.tempId); // Find existing by tempId (unique per upload slot)

  //   if (!existing) {
  //     // First time seeing this file
  //     const model = {
  //       ...event,
  //       id: this.uploadIdCounter++, // permanent id
  //       type,
  //     };

  //     list.push(model);
  //     return;
  //   }

  //   Object.assign(existing, event); // Update the existing upload model

  //   // Only sync to form when upload is fully complete
  //   if (event.progress === 100) {
  //     this.syncImageToForm(existing, type);
  //   }
  // }

  // private syncImageToForm(file: UploadFileModel, type: UploadImageType) {
  //   let images = this.imagesForm.value.images || [];

  //   const imageData = {
  //     id: file.id,
  //     file_name: file.file.name,
  //     type,
  //     data: file.base64,
  //   };

  //   const existsIndex = images.findIndex((x: any) => x.id === file.id);

  //   if (existsIndex === -1) {
  //     images.push(imageData);
  //   } else {
  //     images[existsIndex] = imageData;
  //   }

  //   this.imagesForm.patchValue({ images });
  // }

  // removeExteriorImage(id: number) {
  //   this.exteriorImages = this.exteriorImages.filter((x) => x.id !== id);
  //   this.removeImageFromForm(id);
  // }

  // removeInteriorImage(id: number) {
  //   this.interiorImages = this.interiorImages.filter((x) => x.id !== id);
  //   this.removeImageFromForm(id);
  // }

  // removeImageFromForm(id: number) {
  //   const images = this.imagesForm.value.images || [];
  //   const updated = images.filter((img: any) => img.id !== id);
  //   this.imagesForm.patchValue({ images: updated });
  // }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
