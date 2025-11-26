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
import { StepSchema } from '../../model/step-engine/step-schema';
import { StepEngine } from '../../model/step-engine/step-engine';

type UploadImageType =
  | 'INTERIOR'
  | 'EXTERIOR'
  | 'FLOOR_PLAN_DOCUMENT'
  | 'TENANT_DOCUMENT'
  | 'EJARI_CERTIFICATE'
  | 'PMC_DOCUMENT'
  | 'CHEQUE_DOCUMENT';

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
  isInvalid = this.formService.isInvalid;
  propertyType: any[] = [];
  PMC_List: any[] = [];

  basicDetailsForm = this.propertyFormService.propertyBasicDetailsForm;
  commercialsForm = this.propertyFormService.propertyCommercialsForm;
  imagesForm = this.propertyFormService.propertyImagesForm;
  documentationForm = this.propertyFormService.propertyDocumentationForm;

  engine!: StepEngine;
  steps: StepSchema[] = [];

  private destroy$ = new Subject<void>();

  constructor(private router: Router, private themeService: ThemeService) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);

    this.steps = this.propertyFormService.buildPropertySteps();
    this.engine = new StepEngine(this.steps);

    const formId = this.route.snapshot.paramMap.get('id');
    if (formId) {
      //For edit get and patch form
    } else {
    }
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
    this.router.navigate(['dashboard/properties']);
  }

  onUpload(type: UploadImageType, event: UploadFileModel) {
    this.handleUploadEvent(type, event);
  }

  private handleUploadEvent(type: UploadImageType, event: UploadFileModel) {}

  remove(type: UploadImageType, item: any) {}

  removeItem(type: UploadImageType, id: number, isBackend = false) {}

  getItems(type: UploadImageType) {
    return [];
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
