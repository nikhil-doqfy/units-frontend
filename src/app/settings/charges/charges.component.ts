import { Component, DestroyRef, inject, TemplateRef } from '@angular/core';
import { WhiteCardComponent } from '../../shared/component/white-card/white-card.component';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PlusIconComponent } from '../../shared/component/icons/plus-icon/plus-icon.component';
import { EditIconComponent } from '../../dashboard/component/icons/edit-icon/edit-icon.component';
import { DeleteIconComponent } from '../../dashboard/component/icons/delete-icon/delete-icon.component';
import { SaveIconComponent } from '../../icons/save-icon/save-icon.component';
import { BreadCrumb } from '../../shared/model/shared.model';
import { SharedService } from '../../shared.service';
import { ChargesService } from '../../charges.service';
import { NoDataComponent } from '../../no-data/no-data.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomSelectComponent } from '../../dashboard/component/custom-select/custom-select.component';
import { SharedApiService } from '../../shared/services/shared-api.service';
import { AlertService } from '../../shared/services/alert.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { StorageService } from '../../shared/services/storage.service';

export interface Charge {
  id?: number;
  label: string;
  amount: number | null;
  tax: string;
  vat: number | null;
  editable?: boolean;
  total: number | null;
  checked: boolean;
  isNew?: boolean;
  isEdit?: boolean;
}

@Component({
  selector: 'app-charges',
  standalone: true,
  imports: [
    WhiteCardComponent,
    CommonModule,
    TranslateModule,
    FormsModule,
    PlusIconComponent,
    EditIconComponent,
    DeleteIconComponent,
    SaveIconComponent,
    ReactiveFormsModule,
    NoDataComponent,
    CustomSelectComponent,
  ],
  templateUrl: './charges.component.html',
  styleUrl: './charges.component.css',
})
export class ChargesComponent {
  private sharedService = inject(SharedService);
  private sharedApiService = inject(SharedApiService);
  private alertService = inject(AlertService);
  private modalService = inject(NgbModal);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private chargesService = inject(ChargesService);
  private storageService = inject(StorageService);

  currentLanguage = 'en';
  showDetailView: boolean = false;
  breadcrumbData: BreadCrumb[] = [];
  activeRow: number | null = null;
  chargesForm!: FormGroup;
  addChargeForm!: FormGroup;

  pmcList: any[] = [];
  selectedPmc: any = null;
  filterPmc: any = null;
  isSubmitting = false;

  ngOnInit() {
    this.initAddChargeForm();
    this.chargesForm = this.fb.group({
      charges: this.fb.array([]),
    });
    this.loadBreadcrumb();
    this.loadPmcOptions();
    this.sharedService.initLanguage();
  }

  initAddChargeForm() {
    this.addChargeForm = this.fb.group({
      pmc_id: [this.selectedPmc?.key ?? null, [Validators.required]],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      amount: [
        null,
        [
          Validators.required,
          Validators.min(0.01),
          Validators.pattern(/^\d+(\.\d{1,2})?$/),
        ],
      ],
      tax_code: [
        '5',
        [Validators.required, Validators.maxLength(20)],
      ],
      is_editable: [false],
    });
  }

  loadPmcOptions(): void {
    this.sharedApiService
      .getOptions({ option_type: 'PMC_BY_PM' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.pmcList = resp?.content?.pmc ?? [];
          const defaultPmc = this.storageService.getDefaultPmc(this.pmcList);
          if (defaultPmc) {
            this.selectedPmc = defaultPmc;
            this.filterPmc = defaultPmc;
            if (this.addChargeForm) {
              this.addChargeForm.patchValue({ pmc_id: defaultPmc.key });
            }
          }
          this.getCharges();
        },
        error: (err) => {
          console.error('Error loading PMC options:', err);
          this.getCharges();
        },
      });
  }

  onFilterPmcChange(option: any): void {
    this.filterPmc = option?.key ? option : null;
    this.getCharges();
  }

  loadBreadcrumb() {
    if (this.showDetailView) {
      this.setBreadCrumb([
        { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
        {
          label: 'PAGE_TITLE.PROPERTIES',
          link: '/dashboard/Charges',
        },
        { label: 'PROPERTY_DETAILS', link: '' },
      ]);
    } else {
      this.setBreadCrumb([
        { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
        { label: 'PAGE_TITLE.CHARGES', link: '/dashboard/Charges' },
      ]);
    }
  }

  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }

  get chargesArray(): FormArray {
    return this.chargesForm.get('charges') as FormArray;
  }

  createChargeForm(c?: any): FormGroup {
    return this.fb.group({
      charge_id: [c?.charge_id || c?.id || null],

      description: [
        c?.description || '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],

      amount: [
        c?.amount ?? null,
        [
          Validators.required,
          Validators.min(0.01),
          Validators.pattern(/^\d+(\.\d{1,2})?$/),
        ],
      ],

      tax_code: [
        c?.tax_code || '5',
        [Validators.required, Validators.maxLength(20)],
      ],

      vat: [c?.vat_amount ?? 0],

      is_editable: [c?.editable || false],
      total: [c?.total ?? 0],
      isNew: [c?.isNew || false],
      isEdit: [false],
    });
  }

  getCharges() {
    const params: Record<string, any> = {};
    if (this.filterPmc?.key) {
      params['pmc_id'] = this.filterPmc.key;
    }

    this.chargesService
      .charges(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          const data = resp?.content ?? [];
          this.chargesArray.clear();

          data.forEach((c: any) => {
            const mapped = {
              id: c.id,
              description: c.description,
              amount: c.amount,
              tax_code: c.tax_code,
              vat_amount: c.vat_amount,
              total: c.total_amount,
              editable: c.is_editable,
            };

            this.chargesArray.push(this.createChargeForm(mapped));
          });
        },
        error: () => {
          this.chargesArray.clear();
        },
      });
  }

  openAddChargeModal(content: TemplateRef<any>) {
    this.initAddChargeForm();
    if (!this.selectedPmc && this.pmcList.length) {
      this.selectedPmc = this.storageService.getDefaultPmc(this.pmcList);
    }
    const currentPmc = this.selectedPmc || this.filterPmc;
    if (currentPmc?.key) {
      this.selectedPmc = currentPmc;
      this.addChargeForm.patchValue({ pmc_id: currentPmc.key });
    }

    this.modalService.open(content, {
      ariaLabelledBy: 'modal-title',
      windowClass: 'mdlCommon mdlSmall',
      centered: true,
    });
  }

  onPmcSelected(option: any): void {
    this.selectedPmc = option;
    this.addChargeForm.patchValue({
      pmc_id: option?.key ?? null,
    });
    this.addChargeForm.get('pmc_id')?.markAsTouched();
  }

  saveNewCharge(modal: any) {
    this.addChargeForm.markAllAsTouched();

    if (this.addChargeForm.invalid) {
      return;
    }

    const formValue = this.addChargeForm.value;
    const payload = {
      pmc_id: formValue.pmc_id,
      description: formValue.description?.trim(),
      amount: formValue.amount,
      tax_code: String(formValue.tax_code ?? '').trim(),
      is_editable: formValue.is_editable ?? false,
    };

    this.isSubmitting = true;
    this.chargesService
      .addCharge(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.isSubmitting = false;
          this.alertService.success(
            resp?.message || 'Charge added successfully'
          );
          modal.close('Save click');
          this.getCharges();
        },
        error: (err: any) => {
          this.isSubmitting = false;
          this.alertService.error(
            err?.error?.message || 'Failed to add charge'
          );
        },
      });
  }

  editRow(index: number) {
    this.chargesArray.controls.forEach((c) => c.patchValue({ isEdit: false }));

    this.chargesArray.at(index).patchValue({
      isEdit: true,
      isNew: false,
    });
  }

  saveRow(index?: number) {
    if (index !== undefined) {
      const rowForm = this.chargesArray.at(index) as FormGroup;

      rowForm.markAllAsTouched();

      if (rowForm.invalid) {
        return;
      }

      const payload = {
        charge_id: rowForm.value.charge_id,
        description: rowForm.value.description?.trim(),
        amount: rowForm.value.amount,
        tax_code: String(rowForm.value.tax_code ?? '').trim(),
        is_editable: rowForm.value.is_editable ?? false,
      };

      this.chargesService.editCharge(payload).subscribe({
        next: (resp: any) => {
          rowForm.patchValue({ isEdit: false });
          this.alertService.success(
            resp?.message || 'Charge updated successfully'
          );
          this.getCharges();
        },
        error: (err: any) => {
          this.alertService.error(
            err?.error?.message || 'Failed to update charge'
          );
        },
      });
    }
  }

  deleteRow(index: number) {
    const row = this.chargesArray.at(index)?.value;

    if (row?.charge_id) {
      this.alertService.confirm(
        () => {
          const payload = {
            charge_id: row.charge_id,
          };

          this.chargesService.deleteCharge(payload).subscribe(() => {
            this.getCharges();
          });
        },
        null,
        this,
        index,
        'Are you sure?',
        'Do you want to delete this charge?'
      );
    } else {
      this.chargesArray.removeAt(index);
    }
  }
}

