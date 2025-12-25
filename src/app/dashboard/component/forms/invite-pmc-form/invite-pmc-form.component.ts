import { Component, DestroyRef, inject, Input } from '@angular/core';

import { ModalFormCardComponent } from '../../modal-form-card/modal-form-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormService } from '../../../../shared/services/form.service';
import { CustomSelectComponent } from '../../../../auth/component/custom-select/custom-select.component';
import { SharedApiService } from '../../../../shared/services/shared-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-invite-pmc-form',
  standalone: true,
  imports: [
    ModalFormCardComponent,
    TranslateModule,
    ReactiveFormsModule,
    CustomSelectComponent,
  ],
  templateUrl: './invite-pmc-form.component.html',
  styleUrl: './invite-pmc-form.component.css',
})
export class InvitePMCFormComponent {
  private fb = inject(FormBuilder);

  private sharedApiService = inject(SharedApiService);
  private destroyRef = inject(DestroyRef);
  propertyList: any[] = [];
  selectedProperty: string | null = null;
  invitePmcForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    invitation_type: ['OWNER_TO_PMC', Validators.required],
    property_unit_id: [null, Validators.required],
  });

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
    this.selectedProperty = option?.value ?? null;
    this.invitePmcForm.patchValue({
      property_unit_id: option?.key ?? null,
    });
  }

  onInvitationTypeSelect(option: any) {
    this.invitePmcForm.patchValue({
      invitation_type: option?.key,
    });
  }

  getPayload() {
    return this.invitePmcForm.value;
  }
}
