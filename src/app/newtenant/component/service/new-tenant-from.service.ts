import { computed, Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

import { ActivatedRoute } from '@angular/router';
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

  handleMainButtonClick(goNext?: () => void) {
    if (this.stepPhase() === 'NEGOTIATION') {
      this.triggerNegotiation();
    } else if (this.stepPhase() === 'CHEQUE') {
      this.triggerChequeRequest();
    } else if (this.agreementPhase() !== 'SIGNED') {
      this.triggerAgreementSignature(goNext!);
    } else {
      this.triggerEjariSignature(goNext);
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
      // 1️⃣ First click → Waiting + Btn change
      this.msgText.set('Waiting for Signature');
      this.showMsg.set(true);
      this.btnTitle.set('Submit for Ejari');
      this.agreementPhase.set('SIGNING');

      // 2️⃣ After 3 sec → Signed msg
      setTimeout(() => {
        this.msgText.set('Signed Successfully');
        this.agreementPhase.set('SIGNED');

        setTimeout(() => {
          this.showMsg.set(false);
        }, 2000);
      }, 3000);
    } else if (this.agreementPhase() === 'SIGNED') {
      // 3️⃣ Submit for Ejari click → Next step
      goNext();
    }
  }

  triggerEjariSignature(goNext?: () => void) {
    if (this.ejariPhase() === 'INIT') {
      // First click
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
}
