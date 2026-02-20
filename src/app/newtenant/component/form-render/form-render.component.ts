import { Component, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewTenantFromService } from '../service/new-tenant-from.service';
import { NewTenant } from '../modules/new-tenant';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';

@Component({
  selector: 'app-form-render',
  standalone: true,
  imports: [CommonModule, WhiteCardComponent],
  templateUrl: './form-render.component.html',
  styleUrl: './form-render.component.css',
})
export class FormRenderComponent {
  @Input() steps: any;
  @Input() activeIndex: any;

  subIndex = signal(0);

  get currentStep() {
    return this.steps()[this.activeIndex()];
  }

  get currentSubStep() {
    return this.currentStep?.subSteps?.[this.subIndex()];
  }

  next() {
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
