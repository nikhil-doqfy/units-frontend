import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { StepFormLayoutComponent } from '../../component/step-form-layout/step-form-layout.component';
import { StepPaneComponent } from '../../component/step-form-layout/step-pane.component';
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { DateIconComponent } from '../../component/icons/date-icon/date-icon.component';
import { UploadIconComponent } from '../../component/icons/upload-icon/upload-icon.component';
import { UploadDocumentComponent } from '../../component/upload-document/upload-document.component';
import { CrossIconComponent } from '../../component/icons/cross-icon/cross-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedService } from '../../../shared.service';
import { SharedApiService } from '../../../shared/services/shared-api.service';
import { LeaseFormService } from '../../services/lease-form.service';
import { StepEngine } from '../../model/step-engine/step-engine';
import { StepSchema } from '../../model/step-engine/step-schema';
import { FormService } from '../../../shared/services/form.service';

@Component({
  selector: 'app-add-lease',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    StepFormLayoutComponent,
    StepPaneComponent,
    CustomSelectComponent,
    NgbDatepickerModule,
    DateIconComponent,
    UploadIconComponent,
    UploadDocumentComponent,
    CrossIconComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './add-lease.component.html',
  styleUrl: './add-lease.component.css',
})
export class AddLeaseComponent {
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  private sharedAPIService = inject(SharedApiService);
  private leaseFormService = inject(LeaseFormService);
  private formService = inject(FormService);

  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Lease', link: '/dashboard/lease-tenancy' },
    { label: 'Add Lease', link: '' },
  ];

  propertyDetailsForm = this.leaseFormService.leasePropertyDetailsForm;
  commercialDetailsForm = this.leaseFormService.leaseCommercialDetailsForm;
  documentLayoutForm = this.leaseFormService.leaseDocumentsForm;
  negotiationForm = this.leaseFormService.leaseNegotiationForm;
  documentsForm = this.leaseFormService.leaseDocumentsForm;

  propertyList: any[] = [];
  tenantList: any[] = [];

  engine!: StepEngine;
  steps: StepSchema[] = [];

  isInvalid = this.formService.isInvalid;

  constructor(private router: Router, private destroyRef: DestroyRef) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);

    this.steps = this.leaseFormService.buildLeaseSteps();
    this.engine = new StepEngine(this.steps);
    this.leaseFormService.setEngine(this.engine);

    this.getOptionType(['TENANTS_LIST', 'OWNER_PROPERTIES']);
  }

  getOptionType(options: string[]) {
    this.sharedAPIService
      .getOptions({ option_type: options.join(',') })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          const content = res?.content;
          this.tenantList = content?.tenants_list || [];
          this.propertyList = content?.owner_properties || [];
        },
      });
  }

  submitLease(): void {
    console.log('Final Step Completed — Submitting Lease...');
    // Call API or navigate
    this.router.navigate(['dashboard/lease-tenancy']);
  }
}
