import { FormGroup } from '@angular/forms';

export interface NewTenant {
  id: string;
  title: string;

  subSteps?: SubStepSchema[];
}

export interface SubStepSchema {
  id: string;
  title: string;
  description?: string;
  component: any;
  formGroup: FormGroup;
  saveButtonDetails?: {
    title: string;
    buttonType: 'SIMPLE' | 'SIMPLE+DROPDOWN';
    onClick?: () => void;
  };
}
