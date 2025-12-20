import { Component, DestroyRef, inject } from '@angular/core';

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

  userTypeList: any[] = [];
  propertyList: any[] = [];

  invitePmcForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    invitation_type: [null, Validators.required],
    property_unit_id: [null, Validators.required],
  });

  ngOnInit() {
    // this.getOptionsType([
    //   {
    //     param: 'INVITATION_TYPE',
    //     key: 'INVITATION_TYPE',
    //     setter: (data: any[]) => (this.userTypeList = data),
    //   },
    //   {
    //     param: 'PROPERTY',
    //     key: 'PROPERTY',
    //     setter: (data: any[]) => (this.propertyList = data),
    //   },
    // ]);

    this.getOptionsType(['PROPERTY_UNIT']);
  }

  getOptionsType(options: any[]) {
    const type = options.map((o) => o.param).join(',');

    this.sharedApiService.getOptions({ option_type: type }).subscribe({
      next: (res: any) => {
        const content = res?.content || {};
        options.forEach((o) => o.setter(content[o.key] || []));
      },
    });
  }

  onInvitationTypeSelect(option: any) {
    this.invitePmcForm.patchValue({
      invitation_type: option?.key,
    });
  }

  onPropertySelect(option: any) {
    this.invitePmcForm.patchValue({
      property_unit_id: option?.key,
    });
  }

  getPayload() {
    return this.invitePmcForm.value;
  }
}
