import {
  Component,
  ContentChildren,
  QueryList,
  Input,
  Output,
  EventEmitter,
  AfterContentInit,
  inject,
  TemplateRef,
  WritableSignal,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { StepPaneComponent } from './step-pane.component';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { CardTitleComponent } from '../../../shared/component/card-title/card-title.component';
import { DashFormComponent } from '../../../shared/component/dash-form/dash-form.component';
import { InvitePMCButtonComponent } from '../invite-pmc-btn/invite-pmc-btn.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { StepEngine } from '../../model/step-engine/step-engine';
import { StepSchema } from '../../model/step-engine/step-schema';
import { Subscription } from 'rxjs';
import { AlertService } from '../../../shared/services/alert.service';
import { InviteOwnerBtnComponent } from '../invite-owner-btn/invite-owner-btn.component';
import { CircularCrossBtnIconComponent } from '../../../icons/circular-cross-btn-icon/circular-cross-btn-icon.component';
import {
  BulkColumn,
  BulkUploadComponent,
} from '../../../from/bulk-upload/bulk-upload.component';
import { DownloadIconComponent } from '../../../icons/download-icon/download-icon.component';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ViewChild } from '@angular/core';

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
    InviteOwnerBtnComponent,
    CircularCrossBtnIconComponent,
    BulkUploadComponent,
    DownloadIconComponent,
  ],
  templateUrl: './step-form-layout.component.html',
  styleUrls: ['./step-form-layout.component.css'],
})
export class StepFormLayoutComponent implements AfterContentInit {
  @ViewChild('stepper') stepper: any;
  private spinner = inject(NgxSpinnerService);
  private alertService = inject(AlertService);
  @ContentChildren(StepPaneComponent) steps!: QueryList<StepPaneComponent>;
  currentStepIndex: number = 0;
  @Input() leftCardTitle: string = 'Property Details';
  @Input() finishButtonText: string = 'Finish';

  private modalService = inject(NgbModal);
  closeResult: WritableSignal<string> = signal('');
  @Input() engine!: StepEngine;
  @Input() stepSchema: StepSchema[] = [];
  @Input() bulkColumns: BulkColumn[] = [];

  @Output() finish = new EventEmitter<void>();
  @Output() bulkImported = new EventEmitter<any[]>();

  pendingBulkData: any[] = [];

  stepGroups: StepGroup[] = [];
  filteredSteps: StepPaneComponent[] = [];
  totalBlocks = 10;
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

    if (this.engine) {
      this.subs.add(
        this.engine.currentIndex.subscribe((i) => (this.currentStep = i)),
      );
      this.subs.add(this.engine.statuses.subscribe(() => {}));
      this.subs.add(this.engine.loading.subscribe(() => {}));
    }
  }

  openBulkUploadModal(addLeadContent: TemplateRef<any>) {
    this.modalService
      .open(addLeadContent, {
        ariaLabelledBy: 'modal-title',
        windowClass: 'mdlCommon',
        centered: true,
      })
      .result.then(
        (result) => {
          this.closeResult.set(`Closed with: ${result}`);
        },
        (reason) => {
          this.closeResult.set(`Dismissed ${this.getDismissReason(reason)}`);
        },
      );
  }

  // currentStep = 0;

  goToPreviousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }
  // goToPreviousStep() {
  //   console.log('clicked'); // 👈 check first
  //   console.log(this.stepper);
  //   if (this.stepper && this.stepper.previous) {
  //     this.stepper.previous();
  //   }
  // }
  onBulkDataReady(data: any[]) {
    this.pendingBulkData = data;
  }

  onBulkUploadConfirm(modal: any) {
    if (this.pendingBulkData.length > 0) {
      this.bulkImported.emit(this.pendingBulkData);
      this.pendingBulkData = [];
    }
    modal.close('Upload click');
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
          if (currentStep) this.engine.setStepFormMode(currentStep.id, 'EDIT');
        }

        if (result?.content?.id) {
          this.engine.setFormId(result?.content?.id);
        }

        if (result?.status === 201) {
          if (currentStep) this.engine.setStepFormMode(currentStep.id, 'EDIT');
        }
        this.showAlert(result.message);

        const next = this.getNextStep(this.currentStep);
        if (next < this.stepGroups.length)
          this.engine.setStepStatus(this.engine.getSteps()[next].id, 'ONGOING');

        if (this.currentStep === this.stepGroups.length - 1) {
          this.onFinish();
        } else {
          this.currentStep++;
          // this.engine.goTo(this.currentStep);
          this.goToStep(this.currentStep);
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
    // const status = this.engine.getStepStatus(step.id);
    // if (status === 'LOCKED' || status === 'READY') return;

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
