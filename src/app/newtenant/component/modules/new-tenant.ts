import { FormGroup } from '@angular/forms';

export interface NewTenant {
  id: string;
  title: string;
  route: string;
  formGroup: FormGroup;

  subSteps?: SubStepSchema[];
}

export interface SubStepSchema {
  id: string;
  title: string;
  component: any;
  formGroup: FormGroup;
}
