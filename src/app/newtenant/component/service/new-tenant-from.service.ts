import { Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

import { ActivatedRoute } from '@angular/router';
import { NewTenant } from '../modules/new-tenant';
import { CommercialdetailsComponent } from '../commercialdetails/commercialdetails.component';
import { BasicpersonalComponent } from '../basicpersonal/basicpersonal.component';

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
            description: 'Enter tenant personal details',
            component: BasicpersonalComponent,
            formGroup: this.createBasicForm(),
          },
          {
            id: '1-2',
            title: 'Commercial Details',
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
            title: 'Commercial Details',
            component: CommercialdetailsComponent,
            formGroup: this.createCommercialForm(),
          },
          {
            id: '2-2',
            title: 'Basic Personal',
            component: BasicpersonalComponent,
            formGroup: this.createBasicForm(),
          },
        ],
      },
      {
        id: '3',
        title: 'Agreement',
        subSteps: [
          {
            id: '3-1',
            title: 'Basic Personal',
            component: BasicpersonalComponent,
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
            title: 'Commercial Details',
            component: CommercialdetailsComponent,
            formGroup: this.createCommercialForm(),
          },
        ],
      },
      {
        id: '5',
        title: 'Activated',
        subSteps: [
          {
            id: '5-1',
            title: 'Summary',
            component: BasicpersonalComponent,
            formGroup: this.createBasicForm(),
          },
        ],
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
}
