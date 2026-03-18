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
import { CustomSelectComponent } from '../../../component/custom-select/custom-select.component';
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
      invitation_type: ['PMC_TO_OWNER', Validators.required],
      property_unit_id: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.getOptionTypes(['PROPERTY_UNIT']);
  }

  getOptionTypes(options: string[]) {
    this.sharedApiService
      .getOptions({ option_type: options.join(',') })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.propertyList = response?.content?.property_unit ?? [];
        },
      });
  }

  onOptionSelectedPropertyUnit(option: any) {
    if (option?.key)
      this.pmcOwnerForm.patchValue({
        property_unit_id: Number(option.key),
      });
  }

  onInvitationTypeSelect(option: any) {
    this.pmcOwnerForm.patchValue({
      invitation_type: option?.key,
    });
  }

  getPayload() {
    console.log('FINAL PAYLOAD:', this.pmcOwnerForm.value);

    return this.pmcOwnerForm.value;
  }
}
