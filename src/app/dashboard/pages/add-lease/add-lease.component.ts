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
import { LeaseService } from '../../services/lease.service';
import { firstValueFrom } from 'rxjs';

interface OptionsParams {
  param: string;
  key: string;
  setter: (value: any) => void;
}

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
  private leaseService = inject(LeaseService);
  private formService = inject(FormService);

  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Lease', link: '/dashboard/lease-tenancy' },
    { label: 'Add Lease', link: '' },
  ];

  propertyDetailsForm = this.leaseFormService.leasePropertyDetailsForm;
  commercialDetailsForm = this.leaseFormService.leaseCommercialDetailsForm;
  documentLayoutForm = this.leaseFormService.leaseDocumentLayoutForm;
  negotiationForm = this.leaseFormService.leaseNegotiationForm;
  documentsForm = this.leaseFormService.leaseDocumentsForm;

  propertyList: any[] = [];
  tenantList: any[] = [];
  templateList: any[] = [];
  templateFields: any[] = [];
  templateContent = '';

  engine!: StepEngine;
  steps: StepSchema[] = [];

  isInvalid = this.formService.isInvalid;

  constructor(private router: Router, private destroyRef: DestroyRef) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);

    this.steps = this.leaseFormService.buildLeaseSteps();
    this.engine = new StepEngine(this.steps);
    this.leaseFormService.setEngine(this.engine);

    this.getOptionType([
      {
        param: 'TENANTS_LIST',
        key: 'tenants_list',
        setter: (v) => (this.tenantList = v),
      },
      {
        param: 'PMC_PROPERTIES',
        key: 'pmc_properties',
        setter: (v) => (this.propertyList = v),
      },
    ]);

    this.engine.currentIndex
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((index) => {
        console.log('index:---', index);
        if (index === 3) this.getTemplateData();
      });
  }

  getOptionType(options: OptionsParams[]) {
    const type = options.map((o) => o.param).join(',');

    this.sharedAPIService
      .getOptions({ option_type: type })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const content = res?.content || {};

          options.forEach((o) => o.setter(content[o.key] || []));
        },
      });
  }

  get documentLayout() {
    return this.documentLayoutForm.get('documentLayout')?.value;
  }

  onLayoutChange(event: any) {
    const value = event?.target?.value;
    if (!value) return;

    if (value === 'predefinedTemplate') {
      this.getOptionType([
        {
          param: 'PREDEFINED_TEMPLATES',
          key: 'predefined_templates',
          setter: (v) => (this.templateList = v),
        },
      ]);
    }
  }

  getTemplateData() {
    const templateId = this.documentLayoutForm.get('template')?.value;
    if (!templateId && this.documentLayout !== 'predefinedTemplate') return;

    this.leaseService
      .getTemplateData({ template_id: templateId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: async (resp: any) => {
          let content = resp.content;
          if (content.template_path) {
            this.handeleTemplateUrl(content.template_path);
          }
        },
      });
  }

  extractHtmlBody(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.innerHTML;
  }

  handeleTemplateUrl(url: string) {
    this.leaseService
      .getTemplateContent(url)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        const cleanHtml = this.extractHtmlBody(resp);
      });
  }

  submitLease(): void {
    console.log('Final Step Completed — Submitting Lease...');
    // Call API or navigate
    this.router.navigate(['dashboard/lease-tenancy']);
  }
}
