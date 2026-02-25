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
            title: 'Basic Personal',
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
          },
          {
            id: '4-2',
            title: 'Profile',
            component: EjariDocSignatureComponent,
            formGroup: this.createCommercialForm(),
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

  // private showMsg = signal(false);
  // private msgText = signal('');
  // private btnTitle = signal('Send Negotiation');
  // private stepPhase = signal<'NEGOTIATION' | 'CHEQUE'>('NEGOTIATION');

  // getShowMsg() {
  //   return this.showMsg;
  // }

  // getMsgText() {
  //   return this.msgText;
  // }

  // getBtnTitle() {
  //   return this.btnTitle;
  // }

  // /* ================= FLOW LOGIC ================= */

  // handleMainButtonClick() {
  //   if (this.stepPhase() === 'NEGOTIATION') {
  //     this.triggerNegotiation();
  //   } else {
  //     this.triggerChequeRequest();
  //   }
  // }

  // private triggerNegotiation() {
  //   this.msgText.set('Waiting for Negotiation');
  //   this.btnTitle.set('Waiting for Negotiation');
  //   this.showMsg.set(true);

  //   setTimeout(() => {
  //     this.showMsg.set(false);
  //     this.btnTitle.set('Cheque Request');
  //     this.stepPhase.set('CHEQUE');
  //   }, 3000);
  // }

  // private triggerChequeRequest() {
  //   this.msgText.set('Waiting for Cheque');
  //   this.btnTitle.set('Waiting for Cheque');
  //   this.showMsg.set(true);

  //   setTimeout(() => {
  //     this.showMsg.set(false);
  //   }, 3000);
  // }

  /* ================= FORMS ================= */

  private showCheckSection = signal(false);

  getShowCheckSection() {
    return this.showCheckSection;
  }
  private showMsg = signal(false);
  private msgText = signal('');
  private btnTitle = signal<
    'Send Negotiation' | 'Cheque Request' | 'Save & Next'
  >('Send Negotiation');
  private showRefresh = signal(false);
  showRefresh$ = computed(() => this.showRefresh());
  private stepPhase = signal<'NEGOTIATION' | 'CHEQUE' | 'FINAL'>('NEGOTIATION');

  getShowMsg() {
    return this.showMsg;
  }

  getMsgText() {
    return this.msgText;
  }

  getBtnTitle() {
    return this.btnTitle;
  }

  handleMainButtonClick() {
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
  resetFlow() {
    this.btnTitle.set('Send Negotiation');
    this.stepPhase.set('NEGOTIATION');
    this.showMsg.set(false);
    this.msgText.set('');
    this.showCheckSection.set(false);
  }
}
