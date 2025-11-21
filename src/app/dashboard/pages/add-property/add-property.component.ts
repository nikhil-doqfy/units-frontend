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

  exteriorImages: UploadFileModel[] = [];
  interiorImages: UploadFileModel[] = [];

  uploadIdCounter = 1;

  onExteriorImageUploadProgress(event: UploadFileModel) {
    this.handleUploadEvent(event, this.exteriorImages);
    console.log('exteriorImages:--->', this.exteriorImages);
  }

  onInteriorImageUploadProgress(event: UploadFileModel) {
    this.handleUploadEvent(event, this.interiorImages);
  }

  private handleUploadEvent(event: UploadFileModel, list: UploadFileModel[]) {
    const existing = list.find((i) => i.tempId === event.tempId);

    if (!existing) {
      list.push({
        ...event,
        id: this.uploadIdCounter++,
      });
    } else {
      Object.assign(existing, event);
    }
  }

  removeExteriorImage(id: number) {
    this.exteriorImages = this.exteriorImages.filter((x) => x.id !== id);
  }

  removeInteriorImage(id: number) {
    this.interiorImages = this.interiorImages.filter((x) => x.id !== id);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
