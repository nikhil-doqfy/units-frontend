import { Component, inject, Input, signal } from '@angular/core';
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
  ],
  templateUrl: './form-render.component.html',
  styleUrl: './form-render.component.css',
})
export class FormRenderComponent {
  @Input() steps: any;
  @Input() activeIndex: any;
  constructor(private alertService: AlertService) {}
  showInviteMsg = false;
  subIndex = signal(0);
  ProfileComponent = ProfileComponent;
  get currentStep() {
    return this.steps()[this.activeIndex()];
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
    // For CommercialDetails or Profile's first substep

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
}
