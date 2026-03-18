import { Component, DestroyRef, inject } from '@angular/core';

import { ModalFormCardComponent } from '../../modal-form-card/modal-form-card.component';
import { CustomSelectComponent } from '../../custom-select/custom-select.component';
import { TranslateModule } from '@ngx-translate/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormService } from '../../../../shared/services/form.service';
import { SharedApiService } from '../../../../shared/services/shared-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface OptionsParams {
  param: string;
  key: string;
  setter: (value: any) => void;
}

@Component({
  selector: 'app-assign-property-form',
  standalone: true,
  imports: [
    ModalFormCardComponent,
    CustomSelectComponent,
    TranslateModule,
    ReactiveFormsModule,
  ],
  templateUrl: './assign-property-form.component.html',
  styleUrl: './assign-property-form.component.css',
})
export class AssignPropertyFormComponent {
  private formBuilder = inject(FormBuilder);
  private formService = inject(FormService);
  private sharedAPIService = inject(SharedApiService);
  private destroyRef = inject(DestroyRef);

  isInvalid = this.formService.isInvalid;
  myPropertyList: { key: number; value: string }[] = [];
  pmcList: { key: number; value: string }[] = [];
  assignedPrpertyForm: FormGroup = this.formBuilder.group({
    myProperty: ['', [Validators.required]],
    pmc: ['', [Validators.required]],
  });

  constructor() {
    this.getOptionType([
      {
        param: 'OWNER_PROPERTIES',
        key: 'owner_properties',
        setter: (v) => (this.myPropertyList = v),
      },
      {
        param: 'ALL_PMC',
        key: 'all_pmc',
        setter: (v) => (this.pmcList = v),
      },
    ]);
  }

  getOptionType(options: OptionsParams[]) {
    const type = options.map((o) => o.param).join(',');

    this.sharedAPIService
      .getOptions({ option_type: type })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const content = res?.content || {};

          options.forEach((o) => o.setter(content[o.key] || []));
        },
      });
  }
}
