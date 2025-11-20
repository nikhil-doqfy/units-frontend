import {
  Component,
  ContentChildren,
  QueryList,
  Input,
  Output,
  EventEmitter,
  AfterContentInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { StepPaneComponent } from './step-pane.component';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { CardTitleComponent } from '../../../shared/component/card-title/card-title.component';
import { DashFormComponent } from '../../../shared/component/dash-form/dash-form.component';
import { InvitePMCButtonComponent } from '../invite-pmc-btn/invite-pmc-btn.component';
import { PropertyFormService } from '../../services/property-form.service';
import { FormStaus } from '../../model/property.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateModule } from '@ngx-translate/core';

interface StepGroup {
  main: StepPaneComponent;
  sub: StepPaneComponent[];
}

@Component({
  selector: 'app-step-form-layout',
  standalone: true,
  imports: [
    CommonModule,
    WhiteCardComponent,
    CardTitleComponent,
    DashFormComponent,
    InvitePMCButtonComponent,
    TranslateModule,
  ],
  templateUrl: './step-form-layout.component.html',
  styleUrls: ['./step-form-layout.component.css'],
})
export class StepFormLayoutComponent implements AfterContentInit {
  private propertyFormService = inject(PropertyFormService);
  private spinner = inject(NgxSpinnerService);
  @ContentChildren(StepPaneComponent) steps!: QueryList<StepPaneComponent>;

  @Input() leftCardTitle: string = 'Property Details';
  @Input() finishButtonText: string = 'Finish';

  @Output() finish = new EventEmitter<void>();

  stepGroups: StepGroup[] = [];
  filteredSteps: StepPaneComponent[] = []; // For left side list only

  currentStep = 0;

  ngAfterContentInit() {
    const allSteps = this.steps.toArray();
    let currentGroup: StepGroup | null = null;

    allSteps.forEach((step) => {
      if (!step.secondCard) {
        currentGroup = { main: step, sub: [] };
        this.stepGroups.push(currentGroup);
      } else if (currentGroup) {
        currentGroup.sub.push(step);
      }
    });

    this.filteredSteps = this.stepGroups.map((g) => g.main);
  }

  async nextStep() {
    if (this.currentStep < this.stepGroups.length - 1) {
      try {
        this.spinner.show();

        const response = await this.propertyFormService.savePrpertyDetails(
          this.currentStep
        );

        // mark NEXT step as available
        this.propertyFormService.updateFormStatus(
          this.currentStep + 1,
          'ONGOING'
        );

        this.currentStep++;
        this.spinner.hide();
      } catch (err) {
        console.log('Save failed:', err);
      }
    }
  }

  getStatus(step: number): FormStaus {
    return this.propertyFormService.getFormStatus(step);
  }

  goToStep(index: number) {
    // if (this.getStatus(index) === 'READY_TO_START') return;
    this.currentStep = index;
  }

  onFinish() {
    this.finish.emit();
  }
}
