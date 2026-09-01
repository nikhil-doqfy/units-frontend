import { Component, DestroyRef, inject, Input } from '@angular/core';

import { ModalFormCardComponent } from '../../modal-form-card/modal-form-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomSelectComponent } from '../../../component/custom-select/custom-select.component';

// import { CustomSelectComponent } from '../../../../dashboard/component/custom-select/custom-select.component';
// import { CustomSelectComponent } from '../../../../auth/component/custom-select/custom-select.component';
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
  propertyUnitLoaded = false;
  invitePmcForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    // invitation_type: ['OWNER_TO_PMC', Validators.required],
    pmc_id: [null, Validators.required],
  });

  ngOnInit() {
    this.getOptionTypes(['PMC_BY_PM']);
  }

  getOptionTypes(options: string[]) {
    this.sharedApiService
      .getOptions({ option_type: options.join(',') })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.propertyList = response?.content?.pmc ?? [];
        },
      });
  }

  onOptionSelectedPMC(option: any) {
    this.invitePmcForm.patchValue({
      pmc_id: option?.key ?? null,
    });
  }

  // onInvitationTypeSelect(option: any) {
  //   this.invitePmcForm.patchValue({
  //     invitation_type: option?.key,
  //   });
  // }

  getPayload() {
    return this.invitePmcForm.value;
  }
}
