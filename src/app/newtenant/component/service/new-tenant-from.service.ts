import { computed, Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

import { ActivatedRoute, Router } from '@angular/router';
import { NewTenant } from '../modules/new-tenant';
import { CommercialdetailsComponent } from '../commercialdetails/commercialdetails.component';
import { BasicpersonalComponent } from '../basicpersonal/basicpersonal.component';
import { ProfileComponent } from '../profile/profile.component';
import { OnboardingComponent } from '../onboarding/onboarding.component';
import { AgreementComponent } from '../agreement/agreement.component';
import { EjariDocComponent } from '../ejari-doc/ejari-doc.component';
import { EjariDocSignatureComponent } from '../ejari-doc-signature/ejari-doc-signature.component';

@Injectable({
  providedIn: 'root',
})
export class NewTenantFromService {
  private steps = signal<NewTenant[]>([]);
  private activeIndex = signal<number>(0);
  private activeSubIndex = signal<number>(0);
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  PropertySteps() {
    return signal<NewTenant[]>([
      {
        id: '1',
        title: 'Invite',
        subSteps: [
          {
            id: '1-1',
            title: 'Property details',
            description: 'Fill all the fields to add create your lease',
            component: BasicpersonalComponent,
            formGroup: this.createBasicForm(),
            saveButtonDetails: {
              title: 'Save & Next',
              buttonType: 'SIMPLE',
              onClick: () => this.handleMainButtonClick(),
            },
          },
          {
            id: '1-2',
            title: 'Commercial Details',
            description: 'Fill all the fields to add create your lease',
            component: CommercialdetailsComponent,
            formGroup: this.createCommercialForm(),
          },
        ],
      },
      {
        id: '2',
        title: 'Onboarding',
        subSteps: [
          {
            id: '2-1',
            title: 'Profile',
            component: ProfileComponent,
            formGroup: this.createProfileForm(),
          },
          {
            id: '2-2',
            title: 'Profile',
            component: OnboardingComponent,
            formGroup: this.createOnboardingForm(),
          },
        ],
      },
      {
        id: '3',
        title: 'Agreement',
        subSteps: [
          {
            id: '3-1',
            title: 'Profile',
            component: AgreementComponent,
            formGroup: this.createBasicForm(),
            saveButtonDetails: {
              title: 'Send for Signature',
              buttonType: 'SIMPLE',
              onClick: () => this.handleMainButtonClick(),
            },
          },
        ],
      },
      {
        id: '4',
        title: 'Ejari',
        subSteps: [
          {
            id: '4-1',
            title: 'Profile',
            component: EjariDocComponent,
            formGroup: this.createCommercialForm(),
            saveButtonDetails: {
              title: 'Send for Signature',
              buttonType: 'SIMPLE',
              onClick: () => this.startEjariFlow(),
            },
          },
          {
            id: '4-2',
            title: 'Profile',
            component: EjariDocSignatureComponent,
            formGroup: this.createCommercialForm(),
            saveButtonDetails: {
              title: 'Send for Signature',
              buttonType: 'SIMPLE',
              onClick: () => this.ejariDoc(),
            },
          },
        ],
      },
      {
        id: '5',
        title: 'Activated',
      },
    ]);
  }

  getActiveIndex() {
    return this.activeIndex;
  }

  getActiveSubIndex() {
    return this.activeSubIndex;
  }
  private createBasicForm(): FormGroup {
    return this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      phone: [''],
    });
  }

  private createCommercialForm(): FormGroup {
    return this.fb.group({
      companyName: [''],
      tradeLicense: [''],
      vatNumber: [''],
    });
  }

  private createProfileForm(): FormGroup {
    return this.fb.group({
      companyName: [''],
      tradeLicense: [''],
      vatNumber: [''],
    });
  }
  private createOnboardingForm(): FormGroup {
    return this.fb.group({
      companyName: [''],
      tradeLicense: [''],
      vatNumber: [''],
    });
  }

  /* ================= FORMS ================= */

  private showCheckSection = signal(false);

  getShowCheckSection() {
    return this.showCheckSection;
  }
  private showMsg = signal(false);
  private msgText = signal('');
  private btnTitle = signal<
    | 'Send Negotiation'
    | 'Cheque Request'
    | 'Save & Next'
    | 'Send for Signature'
    | 'Submit for Ejari'
    | 'Approval & Generate Invoice'
  >('Send Negotiation');
  private showRefresh = signal(false);
  showRefresh$ = computed(() => this.showRefresh());
  private stepPhase = signal<'NEGOTIATION' | 'CHEQUE' | 'FINAL'>('NEGOTIATION');
  private agreementPhase = signal<'INIT' | 'SIGNING' | 'SIGNED'>('INIT');
  private ejariPhase = signal<'INIT' | 'SIGNING' | 'SIGNED'>('INIT');
  getShowMsg() {
    return this.showMsg;
  }

  getMsgText() {
    return this.msgText;
  }

  getBtnTitle() {
    return this.btnTitle;
  }

  // handleMainButtonClick(goNext?: () => void) {
  //   if (this.stepPhase() === 'NEGOTIATION') {
  //     this.triggerNegotiation();
  //   } else if (this.stepPhase() === 'CHEQUE') {
  //     this.triggerChequeRequest();
  //   } else if (this.agreementPhase() !== 'SIGNED') {
  //     this.triggerAgreementSignature(goNext!);
  //   } else {
  //     this.triggerEjariSignature(goNext);
  //   }
  // }

  handleMainButtonClick(goNext?: () => void, type?: 'AGREEMENT' | 'EJARI') {
    if (type === 'AGREEMENT') {
      this.triggerAgreementSignature(goNext!);
      return;
    }

    if (type === 'EJARI') {
      this.triggerEjariSignature(goNext);
      return;
    }

    if (this.stepPhase() === 'NEGOTIATION') {
      this.triggerNegotiation();
    } else if (this.stepPhase() === 'CHEQUE') {
      this.triggerChequeRequest();
    }
  }

  private triggerNegotiation() {
    this.msgText.set('Waiting for Negotiation');
    this.btnTitle.set('Cheque Request');
    this.showMsg.set(true);

    setTimeout(() => {
      this.showMsg.set(false);
      this.btnTitle.set('Cheque Request');
      this.stepPhase.set('CHEQUE');
    }, 3000);
  }

  private triggerChequeRequest() {
    this.msgText.set('Waiting for Cheque');
    this.btnTitle.set('Save & Next');
    this.showMsg.set(true);

    setTimeout(() => {
      this.showMsg.set(false);
      this.btnTitle.set('Save & Next');
      this.showCheckSection.set(true);
      this.stepPhase.set('FINAL');
    }, 3000);
  }
  startAgreementFlow() {
    this.btnTitle.set('Send for Signature');
    this.agreementPhase.set('INIT');
    this.showMsg.set(false);
    this.msgText.set('');
  }

  triggerAgreementSignature(goNext: () => void) {
    if (this.agreementPhase() === 'INIT') {
      this.msgText.set('Waiting for Signature');
      this.showMsg.set(true);
      this.btnTitle.set('Submit for Ejari');
      this.agreementPhase.set('SIGNING');

      setTimeout(() => {
        this.msgText.set('Signed Successfully');
        this.agreementPhase.set('SIGNED');

        setTimeout(() => {
          this.showMsg.set(false);
        }, 2000);
      }, 3000);
    } else if (this.agreementPhase() === 'SIGNED') {
      goNext();
    }
  }

  triggerEjariSignature(goNext?: () => void) {
    if (this.ejariPhase() === 'INIT') {
      this.msgText.set('Waiting for Signature');
      this.showMsg.set(true);
      this.btnTitle.set('Approval & Generate Invoice');
      this.ejariPhase.set('SIGNING');

      setTimeout(() => {
        this.msgText.set('Signed Successfully');
        this.ejariPhase.set('SIGNED');

        setTimeout(() => {
          this.showMsg.set(false);
        }, 2000);
      }, 3000);
    } else if (this.ejariPhase() === 'SIGNED') {
      goNext?.();
    }
  }
  ejariDoc() {
    this.btnTitle.set('Send for Signature');

    this.msgText.set('');
    this.showMsg.set(false);
    this.ejariPhase.set('INIT');
  }
  startEjariFlow() {
    this.btnTitle.set('Send for Signature');
  }
  resetFlow() {
    this.btnTitle.set('Send Negotiation');
    this.stepPhase.set('NEGOTIATION');
    this.showMsg.set(false);
    this.msgText.set('');
    this.showCheckSection.set(false);
  }
  stepRoutes: { [key: string]: string } = {
    '1-1': '/new-tenant/invite/property',
    '1-2': '/new-tenant/invite/commercial',
    '2-1': '/new-tenant/onboarding/profile',
    '2-2': '/new-tenant/onboarding/onboarding',
    '3-1': '/new-tenant/agreement',
    '4-1': '/new-tenant/ejari/doc',
    '4-2': '/new-tenant/ejari/signature',
  };
  goToStep(stepId: string, subStepId?: string) {
    const steps = this.PropertySteps()();

    // Find the main step index
    const stepIndex = steps.findIndex((s) => s.id === stepId);
    if (stepIndex === -1) return;

    this.activeIndex.set(stepIndex);

    const step = steps[stepIndex];

    // Sub-step handling safely
    let subIndex = 0;
    if (subStepId && step?.subSteps?.length) {
      const foundIndex = step.subSteps.findIndex(
        (sub) => sub?.id === subStepId,
      );
      subIndex = foundIndex !== -1 ? foundIndex : 0;
    }
    this.activeSubIndex.set(subIndex);

    // Router redirect only if subStepId exists in map
    const route = subStepId ? this.stepRoutes[subStepId] : null;
    if (route) {
      this.router.navigate([route]);
    }
  }
}
