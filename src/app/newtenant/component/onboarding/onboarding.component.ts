import {
  Component,
  inject,
  Input,
  signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DocumentTypeItemComponent } from '../../../dashboard/component/document-type-item/document-type-item.component';
import { ArrowDownIconComponent } from '../../../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
import { DownloadIconComponent } from '../../../icons/download-icon/download-icon.component';
import { CustomSelectComponent } from '../../../dashboard/component/custom-select/custom-select.component';
import { TranslateModule } from '@ngx-translate/core';
import { CalenderIconComponent } from '../../../icons/calender-icon/calender-icon.component';
import { CommonModule } from '@angular/common';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AditionaldocumentComponent } from '../../../dashboard/component/forms/aditionaldocument/aditionaldocument.component';
import { NewTenantFromService } from '../service/new-tenant-from.service';
import { SubStepSchema } from '../modules/new-tenant';
import { WarningIconComponent } from '../../../icons/warning-icon/warning-icon.component';
import { ErrorOutlineIconComponent } from '../../../icons/error-outline-icon/error-outline-icon.component';
import { TableSelectComponent } from '../../../dashboard/component/table-select/table-select.component';
import { TablePaginationComponent } from '../../../dashboard/component/table-pagination/table-pagination.component';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { LeaseService } from '../../../dashboard/services/lease.service';
import { AlertService } from '../../../shared/services/alert.service';

export interface OnboardingDoc {
  id: number;
  source: 'tenant' | 'lease';
  file_name: string;
  document_type_id: number;
  document_type_name: string;
  url: string;
}

export interface DocType {
  key: number;
  value: string;
}

export interface TemplateItem {
  id: number;
  name: string;
}

export interface TemplateField {
  id_attribute: string;
  name_attribute: string;
  label: string;
  html_tag: string;
  required: boolean;
  predefined_value: string;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    WhiteCardComponent,
    ReactiveFormsModule,
    DocumentTypeItemComponent,
    ArrowDownIconComponent,
    DownloadIconComponent,
    CustomSelectComponent,
    TranslateModule,
    CalenderIconComponent,
    CommonModule,
    FormsModule,
    AditionaldocumentComponent,
    WarningIconComponent,
    ErrorOutlineIconComponent,
    TableSelectComponent,
    TablePaginationComponent,
  ],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.css',
})
export class OnboardingComponent {
  showCheckSection$  = this.formService.getShowCheckSection();
  chequeConfirmed$   = this.formService.getChequeConfirmed();
  @Input() form!: FormGroup;

  private modalService  = inject(NgbModal);
  private leaseService  = inject(LeaseService);
  private alertService  = inject(AlertService);
  private sanitizer     = inject(DomSanitizer);

  closeResult: WritableSignal<string> = signal('');

  showDropdown  = false;
  uploading     = false;
  componentName = 'onboardingComponent';

  // Cheque data
  rentCheques:       any[] = [];
  additionalCheques: any[] = [];

  // Banks list for cheque form
  banks: { key: number; value: string; ifsc_code: string }[] = [];

  // Add cheque modal
  addingChequeType: 'RENT_CHEQUE' | 'ADDITIONAL_CHEQUE' = 'RENT_CHEQUE';
  savingCheque = false;
  chequeForm = {
    payment_type:             'CHEQUE',
    cheque_number:            '',
    cheque_date:              '',
    start_date:               '',
    end_date:                 '',
    origin_bank_id:           null as number | null,
    origin_account_number:    '',
    origin_ifsc_code:         '',
    settlement_bank_id:       null as number | null,
    settlement_account_number:'',
    settlement_ifsc_code:     '',
    amount:                   null as number | null,
  };
  chequeFile: File | null = null;

  // Pagination (cheque table)
  totalRecords       = 0;
  rowsPerPageOptions = [10, 25, 50, 100];
  rowsPerPage        = 10;
  currentPage        = 1;
  totalPages         = 1;

  // Documents
  tenantDocs: OnboardingDoc[] = [];
  leaseDocs:  OnboardingDoc[] = [];
  docTypes:   DocType[]       = [];

  // Upload-more: selected type from dropdown
  selectedUploadTypeId: number | null = null;

  // Additional document modal
  additionalDocTypeId: number | null = null;

  /*-- msg / btn --*/
  btnTitle$        = this.formService.getBtnTitle();
  showMsg$         = this.formService.getShowMsg();
  msgText$         = this.formService.getMsgText();
  currentSubStep!: SubStepSchema;

  // Template split-view
  templates: TemplateItem[]  = [];
  selectedTemplateId: number | null = null;
  templateFields: TemplateField[]   = [];
  templateValues: Record<string, string> = {};
  rawTemplateHtml = '';
  safeTemplateHtml: SafeHtml = '';
  savingTemplate      = false;
  templateLoading     = false;
  templateLoaded      = false;
  additionalTerms: string[] = [];
  readonly MAX_TERMS = 5;

  constructor(private formService: NewTenantFromService) {}

  ngOnInit() {
    this.formService.resetFlow();
    this.formService.restoreStepFromStage(this.formService.getCurrentLeaseStage());
    this.loadDocuments();
    this.loadTemplates();
    if (this.isChequeCollected) {
      this.loadCheques();
      this.loadBanks();
    }
  }

  private get leaseId(): number | null {
    return this.formService.getLeaseId()();
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  loadDocuments() {
    const id = this.leaseId;
    if (!id) return;

    this.leaseService.getOnboardingDocuments(id).subscribe({
      next: (resp: any) => {
        const c          = resp?.content ?? {};
        this.tenantDocs  = c.tenant_documents ?? [];
        this.leaseDocs   = c.lease_documents  ?? [];
      },
    });

    this.leaseService.getTenantDocumentTypes().subscribe({
      next: (resp: any) => {
        this.docTypes = resp?.content?.tenant_document_type ?? [];
      },
    });
  }

  // ── All docs combined for display ─────────────────────────────────────────

  get allDocs(): OnboardingDoc[] {
    // Merge: lease docs first (uploaded), then tenant docs not already in lease
    const leaseTypeIds = new Set(this.leaseDocs.map((d) => d.document_type_id));
    const tenantOnly   = this.tenantDocs.filter((d) => !leaseTypeIds.has(d.document_type_id));
    return [...this.leaseDocs, ...tenantOnly];
  }

  isLeaseDoc(doc: OnboardingDoc): boolean {
    return doc.source === 'lease';
  }

  // ── Upload More dropdown ───────────────────────────────────────────────────

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  selectUploadType(typeId: number) {
    this.showDropdown        = false;
    this.selectedUploadTypeId = typeId;
    // trigger the hidden file input
    const input = document.getElementById('uploadMoreInput') as HTMLInputElement;
    input?.click();
  }

  onUploadMoreFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.selectedUploadTypeId) return;
    this.uploadFile(file, this.selectedUploadTypeId);
    (event.target as HTMLInputElement).value = '';
  }

  // ── Additional Document modal ──────────────────────────────────────────────

  openAdditionalDocumentModal(content: TemplateRef<any>) {
    this.showDropdown       = false;
    this.additionalDocTypeId = null;
    const modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-title',
      windowClass:    'mdlCommon',
      centered:       true,
    });
    modalRef.result.then(
      (result) => this.closeResult.set(`Closed with: ${result}`),
      (reason) => this.closeResult.set(`Dismissed ${this.getDismissReason(reason)}`),
    );
  }

  additionalDocFile: File | null = null;

  onAdditionalFileSelected(event: Event) {
    this.additionalDocFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  saveAdditionalDocument(modal: any) {
    if (!this.additionalDocTypeId || !this.additionalDocFile) {
      this.alertService.error('Please select a document type and file.');
      return;
    }
    this.uploadFile(this.additionalDocFile, this.additionalDocTypeId, () => modal.close('saved'));
  }

  // ── Core upload ───────────────────────────────────────────────────────────

  private uploadFile(file: File, typeId: number, onDone?: () => void) {
    const id = this.leaseId;
    if (!id) return;

    this.uploading = true;
    const reader   = new FileReader();
    reader.onload  = () => {
      const base64 = (reader.result as string).split(',')[1];
      this.leaseService.uploadOnboardingDocuments({
        lease_id:  id,
        documents: [{ data: base64, file_name: file.name, document_type_id: typeId }],
      }).subscribe({
        next: () => {
          this.alertService.customSuccess('Document uploaded successfully');
          this.loadDocuments();
          this.uploading = false;
          onDone?.();
        },
        error: () => {
          this.alertService.error('Upload failed. Please try again.');
          this.uploading = false;
        },
      });
    };
    reader.readAsDataURL(file);
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  deleteDoc(doc: OnboardingDoc) {
    if (doc.source !== 'lease') return;
    this.leaseService.deleteOnboardingDocument(doc.id).subscribe({
      next: () => {
        this.leaseDocs = this.leaseDocs.filter((d) => d.id !== doc.id);
        this.alertService.customSuccess('Document removed');
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.ESC:           return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK: return 'by clicking on a backdrop';
      default:                                return `with: ${reason}`;
    }
  }

  get isChequeCollected(): boolean {
    return this.formService.getCurrentLeaseStage()?.toUpperCase() === 'CHEQUE_COLLECTED';
  }

  loadCheques() {
    const id = this.leaseId;
    if (!id) return;
    this.leaseService.getLeaseCheques({ lease_id: id }).subscribe({
      next: (resp: any) => {
        const c = resp?.content ?? {};
        this.rentCheques       = c.rent_cheques       ?? [];
        this.additionalCheques = c.additional_cheques ?? [];
      },
    });
  }

  loadBanks() {
    this.leaseService.getBanks().subscribe({
      next: (resp: any) => {
        this.banks = resp?.content?.bank ?? [];
      },
    });
  }

  openAddChequeModal(content: TemplateRef<any>, type: 'RENT_CHEQUE' | 'ADDITIONAL_CHEQUE') {
    this.addingChequeType = type;
    this.chequeForm = {
      payment_type:              'CHEQUE',
      cheque_number:             '',
      cheque_date:               '',
      start_date:                '',
      end_date:                  '',
      origin_bank_id:            null,
      origin_account_number:     '',
      origin_ifsc_code:          '',
      settlement_bank_id:        null,
      settlement_account_number: '',
      settlement_ifsc_code:      '',
      amount:                    null,
    };
    this.chequeFile = null;
    this.modalService.open(content, { ariaLabelledBy: 'add-cheque-title', windowClass: 'mdlCommon', centered: true, size: 'lg' });
  }

  onOriginBankChange() {
    const bank = this.banks.find(b => b.key === this.chequeForm.origin_bank_id);
    this.chequeForm.origin_ifsc_code = bank?.ifsc_code ?? '';
  }

  onSettlementBankChange() {
    const bank = this.banks.find(b => b.key === this.chequeForm.settlement_bank_id);
    this.chequeForm.settlement_ifsc_code = bank?.ifsc_code ?? '';
  }

  onChequeFileSelected(event: Event) {
    this.chequeFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  saveNewCheque(modal: any) {
    const id = this.leaseId;
    if (!id) return;
    this.savingCheque = true;

    const payload: Record<string, any> = {
      lease_id:                  id,
      cheque_type:               this.addingChequeType,
      payment_type:              this.chequeForm.payment_type,
      cheque_number:             this.chequeForm.cheque_number,
      cheque_date:               this.chequeForm.cheque_date,
      start_date:                this.chequeForm.start_date,
      end_date:                  this.chequeForm.end_date,
      origin_bank_id:            this.chequeForm.origin_bank_id,
      origin_account_number:     this.chequeForm.origin_account_number,
      settlement_bank_id:        this.chequeForm.settlement_bank_id,
      settlement_account_number: this.chequeForm.settlement_account_number,
      amount:                    this.chequeForm.amount,
    };

    const doSave = (fileData?: { data: string; file_name: string }) => {
      if (fileData) {
        payload['file_data']  = fileData.data;
        payload['file_name']  = fileData.file_name;
      }
      this.leaseService.createLeaseCheque(payload).subscribe({
        next: () => {
          this.alertService.customSuccess('Cheque added successfully');
          this.savingCheque = false;
          modal.close();
          this.loadCheques();
        },
        error: () => {
          this.alertService.error('Failed to add cheque');
          this.savingCheque = false;
        },
      });
    };

    if (this.chequeFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        doSave({ data: base64, file_name: this.chequeFile!.name });
      };
      reader.readAsDataURL(this.chequeFile);
    } else {
      doSave();
    }
  }

  onSaveClick() {
    this.formService.handleMainButtonClick();
  }


  // ── Cheque counter ────────────────────────────────────────────────────────

  chequeCount = 0;
  increment() { this.chequeCount++; }
  decrement() { if (this.chequeCount > 0) this.chequeCount--; }

  onPageSizeChange(event: PageSizeChange) {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
  }

  onPageChange(event: PageChange) {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
  }

  // ── Template split-view ───────────────────────────────────────────────────

  loadTemplates() {
    this.leaseService.getTemplates().subscribe({
      next: (resp: any) => {
        this.templates = resp?.content?.templates ?? [];
        if (this.templates.length > 0) {
          this.selectTemplate(this.templates[0].id);
        }
      },
    });
  }

  selectTemplate(templateId: number) {
    this.selectedTemplateId = templateId;
    this.templateFields     = [];
    this.templateValues     = {};
    this.rawTemplateHtml    = '';
    this.safeTemplateHtml   = '';
    this.additionalTerms    = [];
    this.templateLoading    = true;
    this.templateLoaded     = false;

    this.leaseService.getTemplateFields(templateId, this.leaseId).subscribe({
      next: (resp: any) => {
        const c = resp?.content ?? {};
        this.templateFields  = c.fields ?? [];
        this.rawTemplateHtml = c.html_content ?? '';

        const savedValues:   Record<string, string> = c.saved_values   ?? {};
        const leaseDefaults: Record<string, string> = c.lease_defaults ?? {};

        // Priority: saved > lease defaults > predefined field value
        for (const f of this.templateFields) {
          if (savedValues[f.name_attribute] !== undefined) {
            this.templateValues[f.name_attribute] = savedValues[f.name_attribute];
          } else if (leaseDefaults[f.name_attribute] !== undefined && leaseDefaults[f.name_attribute] !== '') {
            this.templateValues[f.name_attribute] = leaseDefaults[f.name_attribute];
          } else {
            this.templateValues[f.name_attribute] = f.predefined_value ?? '';
          }
        }

        // Also apply saved/default values for attribute-only tokens (e.g. property_usage_*)
        // that are not form fields but appear as class names in the HTML template
        for (const [key, val] of Object.entries(savedValues)) {
          if (!(key in this.templateValues)) this.templateValues[key] = val;
        }
        for (const [key, val] of Object.entries(leaseDefaults)) {
          if (!(key in this.templateValues)) this.templateValues[key] = val;
        }

        // Restore additional terms from saved/default values
        for (let i = 1; i <= this.MAX_TERMS; i++) {
          const key = `additional_term_${i}`;
          const val = savedValues[key] ?? leaseDefaults[key] ?? '';
          if (val) this.additionalTerms[i - 1] = val;
        }
        // Trim trailing empty entries from additionalTerms
        while (this.additionalTerms.length > 0 && !this.additionalTerms[this.additionalTerms.length - 1]) {
          this.additionalTerms.pop();
        }

        if (c.pdf_url) {
          this.lastPdfUrl = c.pdf_url;
          this.formService.setAgreementPdfUrl(c.pdf_url);
        }

        this.rebuildPreview();
        this.templateLoading = false;
        this.templateLoaded  = true;
      },
      error: () => {
        this.templateLoading = false;
        this.templateLoaded  = true;
      },
    });
  }

  // ── Computed field lists ───────────────────────────────────────────────────

  get regularFields(): TemplateField[] {
    return this.templateFields.filter(f => !f.name_attribute.startsWith('additional_term_'));
  }

  // ── Regular field change ──────────────────────────────────────────────────

  onFieldChange(fieldName: string) {
    this.rebuildPreview();
    this.scrollAndHighlight(fieldName);
  }

  // ── Additional terms ──────────────────────────────────────────────────────

  addTerm() {
    if (this.additionalTerms.length >= this.MAX_TERMS) return;
    this.additionalTerms.push('');
    this.syncTermsToValues();
    this.rebuildPreview();
    const newIndex = this.additionalTerms.length; // 1-based for token name
    setTimeout(() => {
      const inputs = document.querySelectorAll<HTMLInputElement>('.term-field-input');
      inputs[inputs.length - 1]?.focus();
      this.scrollAndHighlight(`additional_term_${newIndex}`);
    }, 80);
  }

  removeTerm(index: number) {
    this.additionalTerms.splice(index, 1);
    this.syncTermsToValues();
    this.rebuildPreview();
  }

  onTermChange(index: number) {
    this.syncTermsToValues();
    this.rebuildPreview();
    this.scrollAndHighlight(`additional_term_${index + 1}`);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private syncTermsToValues() {
    for (let i = 1; i <= this.MAX_TERMS; i++) {
      this.templateValues[`additional_term_${i}`] = this.additionalTerms[i - 1] ?? '';
    }
  }

  // ── Preview rebuild with token spans ─────────────────────────────────────

  private rebuildPreview() {
    let html = this.rawTemplateHtml;
    for (const [key, value] of Object.entries(this.templateValues)) {
      html = this.replaceToken(html, key, value ?? '');
    }
    // Leftover tokens not in templateValues — use replaceToken with empty value
    // so attribute tokens get plain '' (not a broken <span>) while text tokens
    // get the grey italic placeholder
    const leftoverKeys = new Set<string>();
    const re = /\$\{(\w+)\}/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) leftoverKeys.add(m[1]);
    for (const key of leftoverKeys) {
      html = this.replaceToken(html, key, '');
    }
    this.safeTemplateHtml = this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * Replaces every occurrence of ${key} in html.
   * - Inside an HTML tag (attribute value) → plain text replacement.
   * - In text content → wrapped in a <span> with inline styles so
   *   Angular encapsulation never interferes.
   */
  private replaceToken(html: string, key: string, value: string): string {
    const token = `\${${key}}`;
    let result = '';
    let cursor = 0;
    let idx: number;

    while ((idx = html.indexOf(token, cursor)) !== -1) {
      result += html.slice(cursor, idx);

      // Is this token inside a tag attribute?  (last '<' is after last '>')
      const before     = html.slice(0, idx);
      const lastOpen   = before.lastIndexOf('<');
      const lastClose  = before.lastIndexOf('>');
      const insideTag  = lastOpen > lastClose;

      if (insideTag) {
        result += value; // plain replacement — don't break the attribute
      } else {
        result += value
          ? `<span id="token-${key}" style="background:#fff9c4;border-radius:3px;padding:1px 3px;font-weight:500">${value}</span>`
          : `<span id="token-${key}" style="color:#aaa;font-style:italic;font-size:0.9em">\${${key}}</span>`;
      }

      cursor = idx + token.length;
    }

    return result + html.slice(cursor);
  }

  // ── Scroll + highlight ────────────────────────────────────────────────────

  scrollAndHighlight(fieldName: string) {
    // Wait for Angular to finish updating [innerHTML] before querying the DOM
    setTimeout(() => {
      const el   = document.getElementById(`token-${fieldName}`);
      const pane = document.querySelector('.template-preview-pane') as HTMLElement;
      if (!el || !pane) return;

      // Scroll only inside the preview pane
      const paneTop    = pane.getBoundingClientRect().top;
      const elTop      = el.getBoundingClientRect().top;
      const targetTop  = pane.scrollTop + (elTop - paneTop) - pane.clientHeight / 2 + el.offsetHeight / 2;
      pane.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });

      // Flash highlight
      el.style.transition = 'none';
      el.style.background  = '#ffd700';
      el.style.borderRadius = '3px';
      el.style.padding     = '1px 4px';
      setTimeout(() => {
        el.style.transition = 'background 1.4s ease';
        el.style.background = el.textContent?.trim() ? '#fff9c4' : '';
      }, 500);
    }, 150);
  }

  saveTemplateData() {
    if (!this.selectedTemplateId || !this.leaseId) return;
    this.syncTermsToValues(); // ensure latest additional terms are in templateValues
    this.savingTemplate = true;
    this.leaseService.addTemplateData({
      template_id: this.selectedTemplateId,
      lease_id: this.leaseId,
      values: this.templateValues,
    }).subscribe({
      next: (resp) => {
        this.alertService.success('Template saved successfully');
        this.savingTemplate = false;
        const pdfUrl = resp?.content?.pdf_url;
        if (pdfUrl) {
          this.lastPdfUrl = pdfUrl;
          this.formService.setAgreementPdfUrl(pdfUrl);
        }
      },
      error: () => {
        this.alertService.error('Failed to save template');
        this.savingTemplate = false;
      },
    });
  }

  lastPdfUrl: string | null = null;

  downloadPdf() {
    if (!this.lastPdfUrl) return;
    const a = document.createElement('a');
    a.href = this.lastPdfUrl;
    a.download = `lease_contract.pdf`;
    a.target = '_blank';
    a.click();
  }
}
