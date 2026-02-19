import { Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

import { ActivatedRoute } from '@angular/router';
import { NewTenant } from '../modules/new-tenant';
import { CommercialdetailsComponent } from '../commercialdetails/commercialdetails.component';

@Injectable({
  providedIn: 'root',
})
export class NewTenantFromService {
  private steps = signal<NewTenant[]>([]);
  private activeIndex = signal<number>(0);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
  ) {}

  PropertySteps(): NewTenant[] {
    return [
      {
        id: 'BASIC_DETAILS',
        title: 'Basic Details',
        route: 'basic-details',
        formGroup: this.fb.group({}),

        subSteps: [
          {
            id: 'ADDRESS_INFO',
            title: 'Address Info',
            component: CommercialdetailsComponent,
            formGroup: this.fb.group({
              address: [''],
              city: [''],
            }),
          },
        ],
      },

      {
        id: 'PROPERTY_IMAGES_DETAILS',
        title: 'Property Image Details',
        route: 'property-images',
        formGroup: this.fb.group({}),
      },

      {
        id: 'DOCUMENTS_DETAILS',
        title: 'Document Details',
        route: 'documents',
        formGroup: this.fb.group({}),
      },
    ];
  }
  getActiveIndex() {
    return this.activeIndex;
  }
  getSteps() {
    return this.steps;
  }
}
