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

import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

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
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  OptionsParams,
  UploadFileModel,
} from '../../../shared/model/shared.model';
import { FileUploadItemComponent } from '../../component/file-upload-item/file-upload-item.component';
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
  private propertyService = inject(PropertyService);
  private leaseService = inject(LeaseService);
  private formService = inject(FormService);
  private sanitizer = inject(DomSanitizer);

  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Lease', link: '/dashboard/lease-tenancy' },
    { label: 'Add Lease', link: '' },
  ];

  propertyDetailForm = this.leaseFormService.propertyDetailsForm;
  tenantDetailsForm = this.leaseFormService.tenantDetailsForm;
  leaseDetailsForm = this.leaseFormService.leaseDetailsForm;
  // documentLayoutForm = this.leaseFormService.leaseDocumentLayoutForm;
  // negotiationForm = this.leaseFormService.leaseNegotiationForm;
  documentsForm = this.leaseFormService.leaseDocumentsForm;

  propertyList: any[] = [];
  propertyUnitList: any[] = [];
  selectedPropertyDetails: any = null;
  selectedTenantDetails: any = null;
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

  documetUploadTypes: UplodTypeModal[] = [];
  activeDocTab!: string;
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

    this.getOptionsTypes([
      {
        param: 'PARENT_PROPERTY',
        key: 'property',
        setter: (v) => (this.propertyList = v),
      },
      {
        param: 'TENANT_BY_COMPANY',
        key: 'tenant',
        setter: (v) => (this.tenantList = v),
      },
      {
        param: 'LEASE_DOCUMENT_CHOICES',
        key: 'lease_document_choices',
        setter: (v) => {
          this.documetUploadTypes = this.getProcessUploadTypes(v, 'documents');
          console.log(this.documetUploadTypes);
          this.activeDocTab = v?.[0]?.key;
        },
      },
    ]);

    // this.engine.currentIndex
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe((index) => {
    //     if (index === 3) this.getTemplateData();
    //   });
  }

  getOptionsTypes(option: OptionsParams[]) {
    this.sharedAPIService.getOptionsType(option);
  }

  onPropertySelect(property: any) {
    if (!property) return;

    this.getOptionsTypes([
      {
        param: 'PROPERTY_UNIT_BY_PROPERTY',
        params: { property_id: property.key },
        key: 'property_unit',
        setter: (v) => (this.propertyUnitList = v),
      },
    ]);
  }

  onUnitSelect(unit: any) {
    if (!unit) return;

    this.propertyService
      .getPropertyDetailsForLease({ property_unit_id: unit.key })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp: any) => {
        this.selectedPropertyDetails = resp.content;
      });
  }

  onTenantSelect(tenant: any) {
    if (!tenant) return;

    this.propertyService
      .getPropertyDetailsForLease({ tenant_id: tenant.key })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp: any) => {
        this.selectedTenantDetails = resp.content;
      });
  }

  getProcessUploadTypes(data: any, formKey: FormKey): UplodTypeModal[] {
    const types = data.map((item: any) => ({
      typeKey: item.key,
      typeLabel: item.value,
      formKey,
    }));
    return types;
  }

  // get documentLayout() {
  //   return this.documentLayoutForm.get('documentLayout')?.value;
  // }

  onLayoutChange(event: any) {
    const value = event?.target?.value;
    if (!value) return;

    if (value === 'predefinedTemplate') {
      this.getOptionsTypes([
        {
          param: 'PREDEFINED_TEMPLATES',
          key: 'predefined_templates',
          setter: (v) => (this.templateList = v),
        },
      ]);
    }
  }

  // getTemplateData() {
  //   const templateId = this.documentLayoutForm.get('template')?.value;
  //   if (!templateId) return;

  //   this.leaseService
  //     .getTemplateData({ template_id: templateId })
  //     .pipe(takeUntilDestroyed(this.destroyRef))
  //     .subscribe((resp: any) => {
  //       const content = resp.content;

  //       if (content.template_path) {
  //         this.buildDynamicForm(content.fields); // build form from metadata
  //         this.subscribeToVariableChanges();
  //         this.handleTemplateUrl(content.template_path); // fetch HTML
  //       }
  //     });
  // }

  // extractHtmlBody(html: string): string {
  //   const parser = new DOMParser();
  //   const doc = parser.parseFromString(html, 'text/html');
  //   return doc.body.innerHTML;
  // }

  // injectVariableSpans(html: string) {
  //   return html.replace(/\$\{([^}]+)\}/g, (_match, key) => {
  //     return `<span data-var="${key}" class="doc-var"></span>`;
  //   });
  // }

  // handleTemplateUrl(url: string) {
  //   this.leaseService
  //     .getTemplateContent(url)
  //     .pipe(takeUntilDestroyed(this.destroyRef))
  //     .subscribe((resp) => {
  //       const cleanHtml = this.extractHtmlBody(resp);

  //       // Inject span for each back-end-defined variable
  //       const processed = this.injectVariableSpans(cleanHtml);

  //       this.processedTemplate =
  //         this.sanitizer.bypassSecurityTrustHtml(processed);

  //       // Wait for HTML to render
  //       setTimeout(() => this.onDocRendered(), 0);
  //     });
  // }

  // buildDynamicForm(fields: any[]) {
  //   this.fields = fields;

  //   const dynamicGroup = this.leaseFormService.leaseNegotiationForm.get(
  //     'dynamicVariables'
  //   ) as FormGroup;

  //   fields.forEach((field) => {
  //     dynamicGroup.addControl(
  //       field.id_attribute,
  //       new FormControl('', this.buildValidators(field))
  //     );
  //   });
  // }

  // buildValidators(field: any) {
  //   const validators = [];

  //   if (field.required) validators.push(Validators.required);
  //   if (field.min_length)
  //     validators.push(Validators.minLength(field.min_length));
  //   if (field.max_length)
  //     validators.push(Validators.maxLength(field.max_length));
  //   if (field.pattern) validators.push(Validators.pattern(field.pattern));

  //   return validators;
  // }

  // subscribeToVariableChanges() {
  //   const dynamicGroup = this.negotiationForm.get(
  //     'dynamicVariables'
  //   ) as FormGroup;

  //   // On form value change then make changes to UI by subscribing
  //   dynamicGroup.valueChanges
  //     .pipe(takeUntilDestroyed(this.destroyRef))
  //     .subscribe((values) => {
  //       Object.entries(values).forEach(([key, value]) => {
  //         const nodes = this.variableNodes[key] || [];
  //         nodes.forEach((node) => {
  //           node.textContent = String(value) ?? '';
  //           if (String(value).trim().length > 0) {
  //             node.setAttribute('data-filled', 'true');
  //           } else {
  //             node.removeAttribute('data-filled');
  //           }
  //           this.negotiationForm
  //             .get('templateValues')
  //             ?.patchValue(dynamicGroup.value);
  //         });
  //       });
  //     });
  // }

  // onDocRendered() {
  //   const container = this.docContainer.nativeElement;
  //   console.log(container);
  //   const nodes = container.querySelectorAll('[data-var]');

  //   this.variableNodes = {}; // reset before repopulating

  //   nodes.forEach((node: HTMLElement) => {
  //     const key = node.getAttribute('data-var');
  //     if (!key) return;

  //     if (!this.variableNodes[key]) {
  //       this.variableNodes[key] = [];
  //     }

  //     this.variableNodes[key].push(node);
  //   });
  // }

  onUpload(type: string, event: UploadFileModel) {
    this.handleUploadEvent(type, event);
  }

  getUploadConfig(type: string): UploadConfig {
    const cfg = this.documetUploadTypes.find((modal) => modal.typeKey === type);

    if (!cfg) throw new Error('Invalid Type');

    return {
      form: this.documentsForm,
      formKey: cfg.formKey,
    };
  }

  private handleUploadEvent(type: string, event: UploadFileModel) {
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

  submitLease(): void {
    console.log('Final Step Completed — Submitting Lease...');
    // Call API or navigate
    this.router.navigate(['dashboard/lease-tenancy']);
  }
}
