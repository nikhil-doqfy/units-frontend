import {
  Component,
  inject,
  Input,
  signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
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
import { AddTenantFormComponent } from '../../../dashboard/component/forms/add-tenant-form/add-tenant-form.component';
import { AditionaldocumentComponent } from '../../../dashboard/component/forms/aditionaldocument/aditionaldocument.component';
import { SendNegotiationComponent } from '../../../dashboard/component/forms/send-negotiation/send-negotiation.component';
import { FormRenderComponent } from '../form-render/form-render.component';
import { NewTenantFromService } from '../service/new-tenant-from.service';
import { SubStepSchema } from '../modules/new-tenant';
import { WarningIconComponent } from '../../../icons/warning-icon/warning-icon.component';
import { ErrorOutlineIconComponent } from '../../../icons/error-outline-icon/error-outline-icon.component';
import { TableSelectComponent } from '../../../dashboard/component/table-select/table-select.component';
import { TablePaginationComponent } from '../../../dashboard/component/table-pagination/table-pagination.component';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { AditionalDocumentDownloadIconComponent } from '../../../aditional-document-download-icon/aditional-document-download-icon.component';

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
    AditionalDocumentDownloadIconComponent,
  ],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.css',
})
export class OnboardingComponent {
  showCheckSection$ = this.formService.getShowCheckSection();
  @Input() form!: FormGroup;
  private modalService = inject(NgbModal);
  closeResult: WritableSignal<string> = signal('');
  // currentSubStep: number = 0;
  showDropdown = false;
  componentName: string = 'onboardingComponent';
  totalRecords: number = 0;
  rowsPerPageOptions: number[] = [10, 25, 50, 100];
  rowsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;
  ngOnInit() {
    this.formService.resetFlow();
  }
  toggleDropdown() {
    console.log('CLICKED');
    this.showDropdown = !this.showDropdown;
    console.log('showDropdown = ', this.showDropdown);
  }

  uploadAdditionalDoc() {
    this.showDropdown = false;
    console.log('Additional Document clicked');
  }
  showWaitingMsg = false;

  sendNegotiation() {
    this.showWaitingMsg = true;

    setTimeout(() => {
      this.showWaitingMsg = false;
    }, 2000);
  }

  private getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.ESC:
        return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK:
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }
  openAdditionalDocumentModal(additionalDocumentContent: TemplateRef<any>) {
    const modalRef = this.modalService.open(additionalDocumentContent, {
      ariaLabelledBy: 'modal-title',
      windowClass: 'mdlCommon',
      centered: true,
    });

    modalRef.result.then(
      (result) => {
        this.closeResult.set(`Closed with: ${result}`);
      },
      (reason) => {
        this.closeResult.set(`Dismissed ${this.getDismissReason(reason)}`);
      },
    );
  }
  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
  }

  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
  }
  /*------------------------------------------msg -----------------------------*/
  btnTitle$ = this.formService.getBtnTitle();
  showMsg$ = this.formService.getShowMsg();
  msgText$ = this.formService.getMsgText();
  currentSubStep!: SubStepSchema;
  constructor(private formService: NewTenantFromService) {}

  // showCheckSection = false;

  onSaveClick() {
    this.formService.handleMainButtonClick();
  }

  chequeCount: number = 0;

  increment() {
    this.chequeCount++;
  }

  decrement() {
    if (this.chequeCount > 0) {
      this.chequeCount--;
    }
  }
}
