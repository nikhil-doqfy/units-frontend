import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewTenantFromService } from '../service/new-tenant-from.service';
import { NewTenant } from '../modules/new-tenant';

@Component({
  selector: 'app-form-render',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-render.component.html',
  styleUrl: './form-render.component.css',
})
export class FormRenderComponent {
  @Input() steps: any;
  @Input() activeIndex: any;
  engine = inject(NewTenantFromService);

  getSteps() {
    return this.steps;
  }
  goToStep(index: number) {
    this.setActiveIndex(index);
  }

  getActiveIndex() {
    return this.activeIndex();
  }

  get currentSubStep() {
    return this.getActiveStep();
  }
  setActiveIndex(index: number) {
    this.activeIndex.set(index);
  }

  next() {
    if (this.activeIndex() < this.steps().length - 1) {
      this.activeIndex.set(this.activeIndex() + 1);
    }
  }

  prev() {
    if (this.activeIndex() > 0) {
      this.activeIndex.set(this.activeIndex() - 1);
    }
  }

  getActiveStep() {
    return this.steps()[this.activeIndex()];
  }

  // syncWithRoute(route: string) {
  //   const index = this.steps().findIndex((s) => s.route === route);
  //   if (index >= 0) this.activeIndex.set(index);
  // }
}

// steps = this.engine.getSteps;
// activeIndex = this.engine.getActiveIndex;

// setSteps(steps: NewTenant[]) {
//   this.steps.set(steps);
// }

// getSteps() {
//   return this.steps;
// }

// getActiveIndex() {
//   return this.activeIndex;
// }

// setActiveIndex(index: number) {
//   this.activeIndex.set(index);
// }

// next() {
//   if (this.activeIndex() < this.steps().length - 1) {
//     this.activeIndex.set(this.activeIndex() + 1);
//   }
// }

// prev() {
//   if (this.activeIndex() > 0) {
//     this.activeIndex.set(this.activeIndex() - 1);
//   }
// }

// getActiveStep() {
//   return this.steps()[this.activeIndex()];
// }
