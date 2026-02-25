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
    ProfileComponent,
    ArrowDownIconComponent,
    TranslateModule,
    SendNegotiationComponent,
  ],
  templateUrl: './form-render.component.html',
  styleUrl: './form-render.component.css',
})
export class FormRenderComponent {
  @Input() steps: any;
  @Input() activeIndex: any;
  private modalService = inject(NgbModal);
  closeResult: WritableSignal<string> = signal('');

  constructor(
    private alertService: AlertService,
    private formService: NewTenantFromService,
  ) {}
  showInviteMsg = false;
  subIndex = signal(0);
  ProfileComponent = ProfileComponent;
  OnboardingComponent = OnboardingComponent;
  get currentStep() {
    return this.steps()[this.activeIndex()];
  }

  showWaitingMsg = true;
  isChequeStep = false;
  @Output() negotiationClick = new EventEmitter<void>();

  onClick() {
    this.negotiationClick.emit();
  }
  nextStepAction() {
    if (this.isChequeStep) {
    } else {
    }
  }
  showNegotiationMsg = false;
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
  // getNextBtnLabel() {
  //   if (this.currentSubStep?.component === CommercialdetailsComponent) {
  //     return 'Send Invite';
  //   }
  //   return 'Save & Next';
  // }

  getNextBtnLabel() {
    if (this.currentSubStep?.component === CommercialdetailsComponent) {
      return 'Send Invite';
    }
    if (
      this.currentSubStep?.component === ProfileComponent &&
      this.subIndex() === 0
    ) {
      return 'Save & Next';
    }

    // Default label
    return 'Save & Next';
  }

  next() {
    if (this.currentSubStep?.component === CommercialdetailsComponent) {
      this.alertService.customSuccess('Invite Sent Successfully');

      setTimeout(() => {
        this.goToNextStep();
      }, 3000);

      return;
    }

    this.goToNextStep();
  }

  goToNextStep() {
    if (this.subIndex() < this.currentStep.subSteps.length - 1) {
      this.subIndex.set(this.subIndex() + 1);
    } else if (this.activeIndex() < this.steps().length - 1) {
      this.subIndex.set(0);
      this.activeIndex.set(this.activeIndex() + 1);
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
  // btnTitle$ = this.formService.getBtnTitle();
  // onMainClick() {
  //   this.formService.handleMainButtonClick();
  // }

  btnTitle$ = this.formService.getBtnTitle();
  showMsg$ = this.formService.getShowMsg();
  msgText$ = this.formService.getMsgText();
  showRefresh$ = this.formService.showRefresh$;
  onMainClick() {
    if (this.btnTitle$() === 'Save & Next') {
      this.goToNextStep(); // 👉 NEXT COMPONENT
    } else {
      this.formService.handleMainButtonClick();
    }
  }
}
