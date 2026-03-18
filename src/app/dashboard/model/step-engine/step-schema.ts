import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

export type StepId = string;
export type StepStatus = 'READY' | 'ONGOING' | 'COMPLETED' | 'ERROR' | 'LOCKED';
export type FormMode = 'ADD' | 'EDIT' | 'VIEW';

export interface StepSchema {
  id: StepId;
  title?: string;
  subtitle?: string;
  formGroup: FormGroup;

  // load data for this step (edit mode) - shoul return Observable of API Response
  load?: (context?: any) => Observable<any>;

  // save handler: receivers mapped payload (mapOut result). Returns Observable.
  save?: (payload: any, context?: any) => Observable<any>;

  // map API  response into form patch (for load)
  mapIn?: (apiResonse: any) => Partial<Record<string, any>>;

  // map form.value into paload for save
  mapOut?: (formValue: any) => any;

  // optional: custom uploder plugin or helper object (freeform)
  uploader?: any;

  // optional: when present, step can declare dependencies (e.g., requires property_id)
  requires?: { key: string; from?: 'engine' | 'external' }[];
}
