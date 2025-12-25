import { Component, DestroyRef, inject } from '@angular/core';

import { ModalFormCardComponent } from '../../modal-form-card/modal-form-card.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormService } from '../../../../shared/services/form.service';
import { TranslateModule } from '@ngx-translate/core';
import { CustomSelectComponent } from '../../../../auth/component/custom-select/custom-select.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SharedApiService } from '../../../../shared/services/shared-api.service';

@Component({
  selector: 'app-invite-owner-form',
  standalone: true,
  imports: [
    ModalFormCardComponent,
    ReactiveFormsModule,
    TranslateModule,
    CustomSelectComponent,
  ],
  templateUrl: './invite-owner-form.component.html',
  styleUrl: './invite-owner-form.component.css',
})
export class InviteOwnerFormComponent {
  private formBuilder = inject(FormBuilder);
  private formService = inject(FormService);
  propertyList: any[] = [];
  selectedProperty: string | null = null;
  private destroyRef = inject(DestroyRef);

  pmcOwnerForm!: FormGroup;
  isInvalid = this.formService.isInvalid;
  private sharedApiService = inject(SharedApiService);

  // ------------------------- Invited by PMC TO Owner -------------------------
  constructor() {
    this.pmcOwnerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      invitation_type: ['OWNER_TO_PMC', Validators.required],
      property_unit_id: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.getOptionTypes(['PROPERTY_UNIT']);
  }

  getOptionTypes(options: string[]) {
    console.log('Option types sending:', options);

    this.sharedApiService
      .getOptions({ option_type: options.join(',') })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          // this.propertyList = response?.content?.property_unit ?? [];
          this.propertyList = response?.content?.property_unit ?? [];
          console.log('PROPERTY LIST:', this.propertyList);
        },
      });
  }
  onOptionSelectedPropertyUnit(option: any) {
    console.log('PROPERTY UNIT FROM SELECT:', option);
    this.selectedProperty = option.label;
    if (option && option.value) {
      this.pmcOwnerForm.patchValue({
        property_unit_id: option?.value ?? null,
      });
    } else {
      this.pmcOwnerForm.patchValue({
        property_unit_id: option.key,
      });
    }
  }

  onInvitationTypeSelect(option: any) {
    this.pmcOwnerForm.patchValue({
      invitation_type: option?.key,
    });
  }

  getPayload() {
    return this.pmcOwnerForm.value;
  }
}
