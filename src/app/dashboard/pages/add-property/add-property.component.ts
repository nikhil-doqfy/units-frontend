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
  | 'property_floor_paln'
  | 'tenant_doc'
  | 'ejari_certificates'
  | 'pmc_docs'
  | 'cheque';

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

  onExteriorImageUploadProgress(event: UploadFileModel) {
    this.handleUploadEvent(event, this.exteriorImages, 'exterior');
  }

  onInteriorImageUploadProgress(event: UploadFileModel) {
    this.handleUploadEvent(event, this.interiorImages, 'interior');
  }

  private handleUploadEvent(
    event: UploadFileModel,
    list: UploadFileModel[],
    type: 'interior' | 'exterior'
  ) {
    const existing = list.find((item) => item.tempId === event.tempId); // Find existing by tempId (unique per upload slot)

    if (!existing) {
      // First time seeing this file
      const model = {
        ...event,
        id: this.uploadIdCounter++, // permanent id
        type,
      };

      list.push(model);
      return;
    }

    Object.assign(existing, event); // Update the existing upload model

    // Only sync to form when upload is fully complete
    if (event.progress === 100) {
      this.syncImageToForm(existing, type);
    }
  }

  private syncImageToForm(file: UploadFileModel, type: string) {
    let images = this.imagesForm.value.images || [];

    const imageData = {
      id: file.id,
      file_name: file.file.name,
      type,
      data: file.base64,
    };

    const existsIndex = images.findIndex((x: any) => x.id === file.id);

    if (existsIndex === -1) {
      images.push(imageData);
    } else {
      images[existsIndex] = imageData;
    }

    this.imagesForm.patchValue({ images });
  }

  removeExteriorImage(id: number) {
    this.exteriorImages = this.exteriorImages.filter((x) => x.id !== id);
    this.removeImageFromForm(id);
  }

  removeInteriorImage(id: number) {
    this.interiorImages = this.interiorImages.filter((x) => x.id !== id);
    this.removeImageFromForm(id);
  }

  removeImageFromForm(id: number) {
    const images = this.imagesForm.value.images || [];
    const updated = images.filter((img: any) => img.id !== id);
    this.imagesForm.patchValue({ images: updated });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
