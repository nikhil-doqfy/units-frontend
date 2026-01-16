import { Component, DestroyRef, inject } from '@angular/core';

import { ModalFormCardComponent } from '../../modal-form-card/modal-form-card.component';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { FormService } from '../../../../shared/services/form.service';
import { TranslateModule } from '@ngx-translate/core';
import { SharedApiService } from '../../../../shared/services/shared-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomSelectComponent } from '../../../component/custom-select/custom-select.component';
@Component({
  selector: 'app-invite-tenant-form',
  standalone: true,
  imports: [
    ModalFormCardComponent,
    ReactiveFormsModule,
    TranslateModule,
    CustomSelectComponent,
  ],
  templateUrl: './invite-tenant-form.component.html',
  styleUrl: './invite-tenant-form.component.css',
})
export class InviteTenantFormComponent {
  private formBuilder = inject(FormBuilder);
  private formService = inject(FormService);
  propertyList: any[] = [];
  tenantForm!: FormGroup;
  isInvalid = this.formService.isInvalid;
  selectedProperty: string | null = null;
  private fb = inject(FormBuilder);
  private sharedApiService = inject(SharedApiService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.tenantForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      invitation_type: ['PMC_TO_TENANT', Validators.required],
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
          this.propertyList = response?.content?.property_unit ?? [];
          console.log('PROPERTY LIST:', this.propertyList);
        },
      });
  }
  onOptionSelectedPropertyUnit(option: any) {
    console.log('PROPERTY UNIT FROM SELECT:', option);

    this.tenantForm.patchValue({
      property_unit_id: Number(option.key) ?? null,
    });
  }
  onInvitationTypeSelect(option: any) {
    this.tenantForm.patchValue({
      invitation_type: option?.key,
    });
  }

  getPayload() {
    return this.tenantForm.value;
  }
}
