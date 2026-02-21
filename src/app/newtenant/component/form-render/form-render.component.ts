import { Component, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewTenantFromService } from '../service/new-tenant-from.service';
import { NewTenant } from '../modules/new-tenant';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { CircularCrossBtnIconComponent } from '../../../icons/circular-cross-btn-icon/circular-cross-btn-icon.component';
import { LeftArrowIconComponent } from '../../../icons/left-arrow-icon/left-arrow-icon.component';
import { CommercialdetailsComponent } from '../commercialdetails/commercialdetails.component';

@Component({
  selector: 'app-form-render',
  standalone: true,
  imports: [
    CommonModule,
    WhiteCardComponent,
    CircularCrossBtnIconComponent,
    LeftArrowIconComponent,
  ],
  templateUrl: './form-render.component.html',
  styleUrl: './form-render.component.css',
})
export class FormRenderComponent {
  @Input() steps: any;
  @Input() activeIndex: any;

  showInviteMsg = false;
  subIndex = signal(0);

  get currentStep() {
    return this.steps()[this.activeIndex()];
  }

  get currentSubStep() {
    return this.currentStep?.subSteps?.[this.subIndex()];
  }
  getNextBtnLabel() {
    if (this.currentSubStep?.component === CommercialdetailsComponent) {
      return 'Send Invite';
    }
    return 'Save & Next';
  }
  // next() {
  //   if (this.subIndex() < this.currentStep.subSteps.length - 1) {
  //     this.subIndex.set(this.subIndex() + 1);
  //   } else if (this.activeIndex() < this.steps().length - 1) {
  //     this.subIndex.set(0);
  //     this.activeIndex.set(this.activeIndex() + 1);
  //   }
  // }

  next() {
    console.log('Clicked');
    console.log(this.currentSubStep?.component);
    if (this.currentSubStep?.component === CommercialdetailsComponent) {
      this.showInviteMsg = true;

      setTimeout(() => {
        this.showInviteMsg = false;
        if (this.subIndex() < this.currentStep.subSteps.length - 1) {
          this.subIndex.set(this.subIndex() + 1);
        } else if (this.activeIndex() < this.steps().length - 1) {
          this.subIndex.set(0);
          this.activeIndex.set(this.activeIndex() + 1);
        }
      }, 3000); // 3 sec nantar hide
    }

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
