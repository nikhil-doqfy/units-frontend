import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

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
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UploadFileModel } from '../../../shared/model/shared.model';
import { FileUploadItemComponent } from '../../component/file-upload-item/file-upload-item.component';

interface OptionsParams {
  param: string;
  key: string;
  setter: (value: any) => void;
}

type UploadImageType =
  | 'EMIRATES_ID'
  | 'PASSPORT_SELF'
  | 'PASSPORT_FAMILY'
  | 'EMPLOYMENT_PROOF'
  | 'VISA_SELF'
  | 'VISA_FAMILY'
  | 'BANK_STATEMENT';

type FormKey = 'documents';

interface UploadConfig {
  form: FormGroup;
  formKey: FormKey;
}

type UploadConfigRecord = Record<UploadImageType, UploadConfig>;

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
    FileUploadItemComponent,
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
  private sanitizer = inject(DomSanitizer);

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

  processedTemplate: SafeHtml = '';
  variableNodes: Record<string, HTMLElement[]> = {};
  fields: any;

  uploadIdCounter = {
    documents: 1,
  };

  @ViewChild('docContainer', { static: false }) docContainer!: ElementRef;

  constructor(private router: Router, private destroyRef: DestroyRef) {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);

    this.steps = this.leaseFormService.buildLeaseSteps();
    this.engine = new StepEngine(this.steps);
    this.leaseFormService.setEngine(this.engine);

    const formId = this.route.snapshot.paramMap.get('id');
    if (formId) {
      this.engine.setFormId(+formId);
      this.engine.loadStep(0);
    }

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
    if (!templateId) return;

    this.leaseService
      .getTemplateData({ template_id: templateId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp: any) => {
        const content = resp.content;

        if (content.template_path) {
          this.buildDynamicForm(content.fields); // build form from metadata
          this.subscribeToVariableChanges();
          this.handleTemplateUrl(content.template_path); // fetch HTML
        }
      });
  }

  extractHtmlBody(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.innerHTML;
  }

  injectVariableSpans(html: string) {
    return html.replace(/\$\{([^}]+)\}/g, (_match, key) => {
      return `<span data-var="${key}" class="doc-var"></span>`;
    });
  }

  handleTemplateUrl(url: string) {
    this.leaseService
      .getTemplateContent(url)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        const cleanHtml = this.extractHtmlBody(resp);

        // Inject span for each back-end-defined variable
        const processed = this.injectVariableSpans(cleanHtml);

        this.processedTemplate =
          this.sanitizer.bypassSecurityTrustHtml(processed);

        // Wait for HTML to render
        setTimeout(() => this.onDocRendered(), 0);
      });
  }

  buildDynamicForm(fields: any[]) {
    this.fields = fields;

    const dynamicGroup = this.leaseFormService.leaseNegotiationForm.get(
      'dynamicVariables'
    ) as FormGroup;

    fields.forEach((field) => {
      dynamicGroup.addControl(
        field.id_attribute,
        new FormControl('', this.buildValidators(field))
      );
    });
  }

  buildValidators(field: any) {
    const validators = [];

    if (field.required) validators.push(Validators.required);
    if (field.min_length)
      validators.push(Validators.minLength(field.min_length));
    if (field.max_length)
      validators.push(Validators.maxLength(field.max_length));
    if (field.pattern) validators.push(Validators.pattern(field.pattern));

    return validators;
  }

  subscribeToVariableChanges() {
    const dynamicGroup = this.negotiationForm.get(
      'dynamicVariables'
    ) as FormGroup;

    // On form value change then make changes to UI by subscribing
    dynamicGroup.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((values) => {
        Object.entries(values).forEach(([key, value]) => {
          const nodes = this.variableNodes[key] || [];
          nodes.forEach((node) => {
            node.textContent = String(value) ?? '';
            if (String(value).trim().length > 0) {
              node.setAttribute('data-filled', 'true');
            } else {
              node.removeAttribute('data-filled');
            }
            this.negotiationForm
              .get('templateValues')
              ?.patchValue(dynamicGroup.value);
          });
        });
      });
  }

  onDocRendered() {
    const container = this.docContainer.nativeElement;
    console.log(container);
    const nodes = container.querySelectorAll('[data-var]');

    this.variableNodes = {}; // reset before repopulating

    nodes.forEach((node: HTMLElement) => {
      const key = node.getAttribute('data-var');
      if (!key) return;

      if (!this.variableNodes[key]) {
        this.variableNodes[key] = [];
      }

      this.variableNodes[key].push(node);
    });
  }

  onUpload(type: UploadImageType, event: UploadFileModel) {
    this.handleUploadEvent(type, event);
  }

  getUploadConfig(type: UploadImageType): UploadConfig {
    const uploadConfig: UploadConfigRecord = {
      EMIRATES_ID: {
        form: this.documentsForm,
        formKey: 'documents',
      },
      PASSPORT_SELF: {
        form: this.documentsForm,
        formKey: 'documents',
      },

      PASSPORT_FAMILY: {
        form: this.documentsForm,
        formKey: 'documents',
      },
      EMPLOYMENT_PROOF: {
        form: this.documentsForm,
        formKey: 'documents',
      },
      VISA_SELF: {
        form: this.documentsForm,
        formKey: 'documents',
      },
      VISA_FAMILY: {
        form: this.documentsForm,
        formKey: 'documents',
      },
      BANK_STATEMENT: {
        form: this.documentsForm,
        formKey: 'documents',
      },
    };

    return uploadConfig[type];
  }

  private handleUploadEvent(type: UploadImageType, event: UploadFileModel) {
    const { form, formKey } = this.getUploadConfig(type);
    const items = [...(form.value[formKey] || [])];

    const index = items.findIndex((x) => x.tempId === event.tempId);
    const counterKey = 'documents';

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

  submitLease(): void {
    console.log('Final Step Completed — Submitting Lease...');
    // Call API or navigate
    this.router.navigate(['dashboard/lease-tenancy']);
  }
}
