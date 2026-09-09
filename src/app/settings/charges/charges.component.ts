import { Component, DestroyRef, inject } from '@angular/core';
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
  ],
  templateUrl: './charges.component.html',
  styleUrl: './charges.component.css',
})
export class ChargesComponent {
  private sharedService = inject(SharedService);
  private fb = inject(FormBuilder);
  private chargesService = inject(ChargesService);
  currentLanguage = 'en';
  showSave = false;
  showDetailView: boolean = false;
  breadcrumbData: BreadCrumb[] = [];
  activeRow: number | null = null;
  chargesForm!: FormGroup;
  ngOnInit() {
    this.chargesForm = this.fb.group({
      charges: this.fb.array([]),
    });
    this.loadBreadcrumb();
    this.getCharges();
    this.sharedService.initLanguage();
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
        c?.tax_code || '',
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
    this.chargesService.charges({}).subscribe((resp: any) => {
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
    });
  }
  addNewRow() {
    const hasNew = this.chargesArray.value.some((c: any) => c.isNew);

    if (hasNew) {
      return;
    }

    this.showSave = true;
    this.chargesArray.insert(0, this.createChargeForm({ isNew: true }));
  }

  editRow(index: number) {
    this.chargesArray.controls.forEach((c) => c.patchValue({ isEdit: false }));

    this.chargesArray.at(index).patchValue({
      isEdit: true,
      isNew: false,
    });

    this.showSave = false;
  }
  saveRow(index?: number) {
    // =========================
    // SAVE NEW CHARGE
    // =========================
    const formValue = this.chargesArray.value;

    const newIndex = formValue.findIndex((c: any) => c.isNew);

    if (newIndex !== -1) {
      const rowForm = this.chargesArray.at(newIndex) as FormGroup;

      rowForm.markAllAsTouched();

      if (rowForm.invalid) {
        return;
      }

      const payload = {
        description: rowForm.value.description.trim(),
        amount: rowForm.value.amount,
        tax_code: String(rowForm.value.tax_code ?? '').trim(),
      };

      this.chargesService.addCharge(payload).subscribe({
        next: () => {
          this.showSave = false;
          this.getCharges();
        },
        error: () => {},
      });

      return;
    }

    // =========================
    // EDIT EXISTING CHARGE
    // =========================
    if (index !== undefined) {
      const rowForm = this.chargesArray.at(index) as FormGroup;

      rowForm.markAllAsTouched();

      if (rowForm.invalid) {
        return;
      }

      const payload = {
        charge_id: rowForm.value.charge_id,
        description: rowForm.value.description.trim(),
        amount: rowForm.value.amount,
        tax_code: String(rowForm.value.tax_code ?? '').trim(),
      };

      this.chargesService.editCharge(payload).subscribe({
        next: () => {
          rowForm.patchValue({ isEdit: false });
          this.getCharges();
        },
        error: () => {},
      });
    }
  }
  deleteRow(index: number) {
    const row = this.chargesArray.at(index)?.value;

    if (row?.charge_id) {
      const payload = {
        charge_id: row.charge_id,
      };

      this.chargesService.deleteCharge(payload).subscribe(() => {
        this.getCharges();
      });
    } else {
      this.chargesArray.removeAt(index);
    }
  }
}
