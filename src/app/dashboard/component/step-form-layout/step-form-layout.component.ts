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
import { FormStaus, PropertyFormStep } from '../../model/property.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { StepEngine } from '../../model/step-engine/step-engine';
import { StepSchema } from '../../model/step-engine/step-schema';
import { Subscription } from 'rxjs';
import { AlertService } from '../../../shared/services/alert.service';

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
  private spinner = inject(NgxSpinnerService);
  private alertService = inject(AlertService);
  @ContentChildren(StepPaneComponent) steps!: QueryList<StepPaneComponent>;

  @Input() leftCardTitle: string = 'Property Details';
  @Input() finishButtonText: string = 'Finish';

  @Input() engine!: StepEngine;
  @Input() stepSchema: StepSchema[] = [];

  @Output() finish = new EventEmitter<void>();

  stepGroups: StepGroup[] = [];
  filteredSteps: StepPaneComponent[] = []; // For left side list only

  currentStep: number = 0;
  private subs = new Subscription();

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

    // subscribe to engine state
    if (this.engine) {
      this.subs.add(
        this.engine.currentIndex.subscribe((i) => (this.currentStep = i))
      );
      this.subs.add(this.engine.statuses.subscribe(() => {}));
      this.subs.add(this.engine.loading.subscribe(() => {}));
    }
  }

  ngOnDestroy() {
    this.engine.reset();
    this.subs.unsubscribe();
  }

  getNextStep(step: number): number {
    return step + 1;
  }

  async nextStep() {
    if (!this.engine) {
      console.warn('StepEngine not provided to StepFormLayoutComponent');
      return;
    }
    if (this.currentStep < this.stepGroups.length) {
      try {
        this.spinner.show();
        const result = await this.engine.saveStep(this.currentStep);

        const currentStep = this.engine.getCurrentStep();

        if (result.local) {
          if (currentStep) this.engine.setStepFormMode(currentStep.id, 'EDIT'); // set edit mode for local
        }

        if (result?.content?.id) {
          this.engine.setFormId(result?.content?.id); // set form id for next form or edit
        }

        if (result?.status === 201) {
          if (currentStep) this.engine.setStepFormMode(currentStep.id, 'EDIT'); // set edit mode afte post
        }
        this.showAlert(result.message);

        const next = this.getNextStep(this.currentStep);
        if (next < this.stepGroups.length)
          this.engine.setStepStatus(this.engine.getSteps()[next].id, 'ONGOING');

        if (this.currentStep === this.stepGroups.length - 1) {
          this.onFinish();
        } else {
          this.currentStep++;
          this.engine.goTo(this.currentStep);
        }
      } catch (err) {
        console.error('Save failed:', err);
      } finally {
        this.spinner.hide();
      }
    }
  }

  showAlert(msg: string) {
    this.alertService.success(msg);
  }

  getStatus(index: number) {
    if (!this.engine) return 'LOCKED';
    const step = this.engine.getStep(index);
    return step ? this.engine.getStepStatus(step.id) : 'LOCKED';
  }

  goToStep(index: number) {
    if (!this.engine) return;

    const step = this.engine.getSteps()[index];
    if (!step) return;
    const status = this.engine.getStepStatus(step.id);
    if (status === 'LOCKED' || status === 'READY') return;

    let mode = this.engine.getStepFormMode(step.id);

    if (mode === 'EDIT') {
      this.engine.loadStep(index);
    }

    this.currentStep = index;
    this.engine.goTo(index);
  }

  onFinish() {
    if (this.engine) this.engine.reset();
    this.finish.emit();
  }
}
