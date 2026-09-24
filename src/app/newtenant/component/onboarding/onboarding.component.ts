import {
  Component,
  inject,
  Input,
  TemplateRef,
} from '@angular/core';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewTenantFromService } from '../service/new-tenant-from.service';
import { SubStepSchema } from '../modules/new-tenant';
import { WarningIconComponent } from '../../../icons/warning-icon/warning-icon.component';
import { TableSelectComponent } from '../../../dashboard/component/table-select/table-select.component';
import { TablePaginationComponent } from '../../../dashboard/component/table-pagination/table-pagination.component';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { LeaseService } from '../../../dashboard/services/lease.service';
import { AlertService } from '../../../shared/services/alert.service';
import { TableActionButtonComponent } from '../../../dashboard/component/table-action-btn/table-action-btn.component';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    WhiteCardComponent,
    ReactiveFormsModule,
    TranslateModule,
    CommonModule,
    FormsModule,
    WarningIconComponent,
    TableSelectComponent,
    TablePaginationComponent,
    TableActionButtonComponent,
  ],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.css',
})
export class OnboardingComponent {
  @Input() form!: FormGroup;

  private modalService  = inject(NgbModal);
  private leaseService  = inject(LeaseService);
  private alertService  = inject(AlertService);

  componentName = 'onboardingComponent';

  // Cheque data -- rent, additional and other-charge cheques shown together
  // in one ledger-style table, sorted by due date.
  allCheques: any[] = [];

  // Banks list for cheque form
  banks: { key: number; value: string; ifsc_code: string }[] = [];

  // Add cheque modal
  addingChequeType: 'RENT_CHEQUE' | 'ADDITIONAL_CHEQUE' = 'RENT_CHEQUE';
  savingCheque = false;

  private todayIsoDate(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  chequeForm = {
    payment_type:             'PDC',
    cheque_number:            '',
    description:              '',
    cheque_date:              this.todayIsoDate(),
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

  /*-- msg / btn --*/
  btnTitle$        = this.formService.getBtnTitle();
  showMsg$         = this.formService.getShowMsg();
  msgText$         = this.formService.getMsgText();
  currentSubStep!: SubStepSchema;

  constructor(private formService: NewTenantFromService) {}

  ngOnInit() {
    // Collect Cheque has no waiting/message state of its own -- just clear
    // whatever showMsg/msgText was left over from a later step (e.g.
    // "Sent for signature...") if the user navigated back here.
    this.formService.resetFlow();
    this.loadCheques();
    this.loadBanks();
  }

  private get leaseId(): number | null {
    return this.formService.getLeaseId()();
  }

  loadCheques() {
    const id = this.leaseId;
    if (!id) return;
    this.leaseService.getLeaseCheques({ lease_id: id }).subscribe({
      next: (resp: any) => {
        const c = resp?.content ?? {};
        this.allCheques = [...(c.all_cheques ?? [])].sort((a, b) =>
          (a.cheque_date || '').localeCompare(b.cheque_date || ''),
        );
      },
    });
  }

  get chequeTotals() {
    return this.allCheques.reduce(
      (acc, c) => ({
        amount: acc.amount + (c.amount || 0),
        vat:    acc.vat    + (c.vat    || 0),
        total:  acc.total  + (c.total  || 0),
      }),
      { amount: 0, vat: 0, total: 0 },
    );
  }

  loadBanks() {
    this.leaseService.getBanks().subscribe({
      next: (resp: any) => {
        this.banks = resp?.content?.bank ?? [];
      },
    });
  }

  // ── Inline row edit (Due Date / Payment Method / Cheque No / Cheque Date /
  // Bank Name / Account Number) — lets details be filled in after a
  // cheque row has already been auto-generated or saved. ────────────────
  editingRowId: number | null = null;
  savingRow = false;
  rowEditForm = {
    cheque_date:        '',
    cheque_number:      '',
    payment_type:       'PDC',
    settlement_account_number: '',
    settlement_bank_id: null as number | null,
  };

  startEditRow(c: any) {
    this.editingRowId = c.id;
    this.rowEditForm = {
      cheque_date:            c.cheque_date || '',
      cheque_number:          c.cheque_number || '',
      payment_type:           c.payment_type || 'PDC',
      settlement_account_number: c.settlement_account_number || '',
      settlement_bank_id:     c.selltlement_bank?.id ?? null,
    };
  }

  cancelEditRow() {
    this.editingRowId = null;
  }

  saveEditRow(c: any) {
    if (this.savingRow) return;
    this.savingRow = true;
    this.leaseService.updateLeaseCheque({
      cheque_id:                 c.id,
      cheque_date:                this.rowEditForm.cheque_date,
      cheque_number:              this.rowEditForm.cheque_number,
      payment_type:                this.rowEditForm.payment_type,
      settlement_account_number:  this.rowEditForm.settlement_account_number,
      settlement_bank_id:          this.rowEditForm.settlement_bank_id,
    }).subscribe({
      next: () => {
        this.savingRow = false;
        this.editingRowId = null;
        this.alertService.customSuccess('Cheque details saved');
        this.loadCheques();
      },
      error: (err: any) => {
        this.savingRow = false;
        this.alertService.error(err?.error?.message || 'Failed to save cheque details');
      },
    });
  }

  downloadingReceipt = false;

  downloadReceipt() {
    const id = this.leaseId;
    if (!id || this.downloadingReceipt) return;
    this.downloadingReceipt = true;

    this.leaseService.getChequeReceiptPdf(id).subscribe({
      next: (resp: any) => {
        this.downloadingReceipt = false;
        const pdfUrl = resp?.content?.pdf_url;
        if (!pdfUrl) {
          this.alertService.error('Failed to generate receipt');
          return;
        }
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = resp?.content?.file_name || 'receipt.pdf';
        link.target = '_blank';
        link.click();
      },
      error: (err: any) => {
        this.downloadingReceipt = false;
        this.alertService.error(err?.error?.message || 'Failed to generate receipt');
      },
    });
  }

  downloadInvoice(c: any) {
    if (!c.invoice_pdf_url) return;
    const link = document.createElement('a');
    link.href = c.invoice_pdf_url;
    link.download = `invoice_${c.code || c.id}.pdf`;
    link.target = '_blank';
    link.click();
  }

  openAddChequeModal(content: TemplateRef<any>, type: 'RENT_CHEQUE' | 'ADDITIONAL_CHEQUE') {
    this.addingChequeType = type;
    this.chequeForm = {
      payment_type:              'PDC',
      cheque_number:             '',
      description:               '',
      cheque_date:               this.todayIsoDate(),
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
      description:               this.chequeForm.description,
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

}
