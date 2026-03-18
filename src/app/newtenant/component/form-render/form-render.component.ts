import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewTenantFromService } from '../service/new-tenant-from.service';
import { NewTenant } from '../modules/new-tenant';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { CircularCrossBtnIconComponent } from '../../../icons/circular-cross-btn-icon/circular-cross-btn-icon.component';
import { LeftArrowIconComponent } from '../../../icons/left-arrow-icon/left-arrow-icon.component';
import { CommercialdetailsComponent } from '../commercialdetails/commercialdetails.component';
import { SendInviteIconComponent } from '../../../icon/send-invite-icon/send-invite-icon.component';
import { AlertService } from '../../../shared/services/alert.service';
import { RefreshIconComponent } from '../../../dashboard/component/icons/refresh-icon/refresh-icon.component';
import { ProfileComponent } from '../profile/profile.component';
import { OnboardingComponent } from '../onboarding/onboarding.component';
import { ArrowDownIconComponent } from '../../../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SendNegotiationComponent } from '../../../dashboard/component/forms/send-negotiation/send-negotiation.component';
import { AgreementComponent } from '../agreement/agreement.component';
import { EjariDocComponent } from '../ejari-doc/ejari-doc.component';
import { EjariDocSignatureComponent } from '../ejari-doc-signature/ejari-doc-signature.component';
import { EjarimodelService } from '../../../ejarimodel.service';

@Component({
  selector: 'app-form-render',
  standalone: true,
  imports: [
    CommonModule,
    WhiteCardComponent,
    CircularCrossBtnIconComponent,
    LeftArrowIconComponent,
    SendInviteIconComponent,
    RefreshIconComponent,
    ArrowDownIconComponent,
    TranslateModule,
  ],
  templateUrl: './form-render.component.html',
  styleUrl: './form-render.component.css',
})
export class FormRenderComponent {
  @Output() negotiationClick = new EventEmitter<void>();

  @Input() steps: any;
  @Input() activeIndex: any;
  private modalService = inject(NgbModal);
  closeResult: WritableSignal<string> = signal('');
  btnTitle = signal<string>('Save & Next');
  agreementPhase = signal<string>('');
  isDropdownOpen = false;
  showInviteMsg = false;
  subIndex = signal(0);
  ProfileComponent = ProfileComponent;
  OnboardingComponent = OnboardingComponent;
  AgreementComponent = AgreementComponent;
  EjariComponent = EjariDocComponent;
  EjariDocSignatureComponent = EjariDocSignatureComponent;
  CommercialdetailsComponent = CommercialdetailsComponent;

  get showDummyLink(): boolean {
    const c = this.currentSubStep?.component;
    return c !== this.ProfileComponent &&
           c !== this.OnboardingComponent &&
           c !== this.AgreementComponent &&
           c !== this.EjariComponent &&
           c !== this.EjariDocSignatureComponent;
  }
  showWaitingMsg = true;
  showNegotiationMsg = false;
  isChequeStep = false;
  btnTitle$ = this.formService.getBtnTitle();
  showMsg$ = this.formService.getShowMsg();
  msgText$ = this.formService.getMsgText();
  showRefresh$ = this.formService.showRefresh$;
  constructor(
    private ejariModelService: EjarimodelService,
    private formService: NewTenantFromService,
    private alertService: AlertService,
  ) { }

  get currentStep() {
    return this.steps()[this.activeIndex()];
  }

  onClick() {
    this.negotiationClick.emit();
  }

  nextStepAction() {
    if (this.isChequeStep) {
    } else {
    }
  }

  sendNegotiation() {
    this.showNegotiationMsg = true;

    setTimeout(() => {
      this.showNegotiationMsg = false;
    }, 2000);

    this.goToNextStep();
  }

  get currentSubStep() {
    return this.currentStep?.subSteps?.[this.subIndex()];
  }

  getComponentInputs(subStep: any): Record<string, any> {
    return { form: subStep.formGroup, ...(subStep.inputs ?? {}) };
  }

  getNextBtnLabel() {
    if (this.currentSubStep?.component === EjariDocSignatureComponent) {
      return this.btnTitle$().trim();
    }
    if (this.currentSubStep?.component === AgreementComponent) {
      return this.btnTitle$();
    }

    if (this.currentSubStep?.component === EjariDocComponent) {
      return 'Send for Signature';
    }

    if (this.currentSubStep?.component === EjariDocSignatureComponent) {
      return this.btnTitle$();
    }

    if (this.currentSubStep?.component === CommercialdetailsComponent) {
      return 'Send Invite';
    }

    if (
      this.currentSubStep?.component === ProfileComponent &&
      this.subIndex() === 0
    ) {
      return 'Save & Next';
    }

    return 'Save & Next';
  }


  next() {
    if (
      this.currentSubStep?.component === EjariDocSignatureComponent &&
      this.getNextBtnLabel() === 'Approval & Generate Invoice'
    ) {
      const button = document.querySelector(
        '.Approval-Generate-invoice',
      ) as HTMLElement;
      // Call your alert service modal
      this.ejariModelService.customTenantSuccessModal(
        'The tenant has been activated and the invoice has been generated successfully.',
        (action) => {
          // Handle actions when user clicks buttons
          if (action === 'invoice') {
            // navigate to invoice page or just close
            console.log('Go to Invoice clicked');
          } else if (action === 'profile') {
            // navigate to tenant profile page
            console.log('View Profile clicked');
          }
          // Move to next step if needed
          this.goToNextStep();
        },
      );

      return; // stop further next() execution
    }
    if (this.currentSubStep?.component === AgreementComponent) {
      this.formService.handleMainButtonClick(
        () => this.goToNextStep(),
        'AGREEMENT',
      );
      return;
    }

    if (this.currentSubStep?.component === EjariDocSignatureComponent) {
      this.formService.handleMainButtonClick(
        () => this.goToNextStep(),
        'EJARI',
      );
      return;
    }
    if (this.currentSubStep?.component === CommercialdetailsComponent) {
      this.formService.saveCommercialStep(this.currentSubStep.formGroup, () => {
        setTimeout(() => this.goToNextStep(), 1000);
      });
      return;
    }

    // BasicPersonal step — save before advancing
    if (this.currentSubStep?.formGroup) {
      this.formService.saveBasicStep(this.currentSubStep.formGroup, () => this.goToNextStep());
      return;
    }

    this.goToNextStep();
  }

  fillDummyData() {
    const form = this.currentSubStep?.formGroup;
    if (!form) return;

    if (this.currentSubStep?.component === CommercialdetailsComponent) {
      form.patchValue({
        startDate:            '2025-01-01',
        endDate:              '2026-01-01',
        graceStartDate:       '2025-01-01',
        graceEndDate:         '2025-01-15',
        annualAmount:         120000,
        actualAnnualAmount:   110000,
        securityBookingAmount: 10000,
        maintenanceCharges:   2000,
        rent:                 10000,
        securityDeposit:      20000,
        commissionPercent:    5,
        noticePeriod:         3,
        contractAmount:       115000,
        discount:             5000,
        shellAndCore:         false,
        paymentCount:         12,
      });
      return;
    }

    // BasicPersonal
    form.patchValue({
      tenantName:     'Ahmed Al Mansoori',
      email:          'ahmed.mansoori@example.com',
      nationality:    'UAE',
      passportNo:     'P1234567',
      passportExpiry: '2028-06-30',
      emiratesId:     '784-1990-1234567-1',
      visaNo:         'V-9876543',
      visaExpiry:     '2026-12-31',
      telNo:          '+971501234567',
      addressLine1:   'Villa 12, Al Barsha',
      addressLine2:   'Dubai, UAE',
    });
  }

  private readonly STAGE_MAP: Record<number, string> = {
    2: 'AGREEMENT',
    3: 'EJARI',
    4: 'ACTIVATED',
  };

  goToNextStep() {
    if (this.subIndex() < this.currentStep.subSteps.length - 1) {
      this.subIndex.set(this.subIndex() + 1);
    } else if (this.activeIndex() < this.steps().length - 1) {
      const newIndex = this.activeIndex() + 1;
      this.subIndex.set(0);
      this.activeIndex.set(newIndex);
      // Persist the stage for steps 2 (Agreement), 3 (Ejari), 4 (Activated).
      // ONBOARDING is already saved by saveCommercialStep when leaving step 0.
      const stage = this.STAGE_MAP[newIndex];
      if (stage) {
        this.formService.updateLeaseStage(stage);
      }
    }
  }
  prev() {
    if (this.subIndex() > 0) {
      this.subIndex.set(this.subIndex() - 1);
    } else if (this.activeIndex() > 0) {
      this.activeIndex.set(this.activeIndex() - 1);
      const prevStep = this.steps()[this.activeIndex()];
      this.subIndex.set(prevStep.subSteps.length - 1);
    }
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
  openAddTenantModal(addTenantContent: TemplateRef<any>) {
    const modalRef = this.modalService.open(addTenantContent, {
      ariaLabelledBy: 'modal-title',
      windowClass: 'mdlCommon right-side-modal',
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

  onMainClick() {
    if (this.btnTitle$() === 'Save & Next') {
      this.goToNextStep();
    } else {
      this.formService.handleMainButtonClick();
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  onArrowClick(event: MouseEvent) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }
}
