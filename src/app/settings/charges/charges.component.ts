import { Component, DestroyRef, inject } from '@angular/core';
import { WhiteCardComponent } from '../../shared/component/white-card/white-card.component';
import { CommonModule } from '@angular/common';
import { TableTitleComponent } from '../../dashboard/component/table-title/table-title.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { PlusIconComponent } from '../../shared/component/icons/plus-icon/plus-icon.component';
import { EditIconComponent } from '../../dashboard/component/icons/edit-icon/edit-icon.component';
import { DeleteIconComponent } from '../../dashboard/component/icons/delete-icon/delete-icon.component';
import { SaveIconComponent } from '../../icons/save-icon/save-icon.component';
import { BreadCrumb } from '../../shared/model/shared.model';
import { SharedService } from '../../shared.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChargesService } from '../../charges.service';
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
    CommonModule,
    FormsModule,
    PlusIconComponent,
    EditIconComponent,
    DeleteIconComponent,
    SaveIconComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './charges.component.html',
  styleUrl: './charges.component.css',
})
export class ChargesComponent {
  private destroyRef = inject(DestroyRef);
  private translate = inject(TranslateService);
  private sharedService = inject(SharedService);
  private fb = inject(FormBuilder);
  private chargesService = inject(ChargesService);
  currentLanguage = 'en';
  showSave = false;
  showDetailView: boolean = false;
  breadcrumbData: BreadCrumb[] = [];

  chargesForm!: FormGroup;
  ngOnInit() {
    this.chargesForm = this.fb.group({
      charges: this.fb.array([]),
    });
    this.loadBreadcrumb();
  }

  initLanguageListener() {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadBreadcrumb();
      });
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
      description: [c?.label || ''],
      amount: [c?.amount || 0],
      tax_code: [c?.tax || ''],
      vat: [c?.vat || 0],
      is_editable: [c?.editable || false],
      total: [c?.total || 0],
      isNew: [c?.isNew || false],
      isEdit: [false],
    });
  }
  getCharges() {
    this.chargesService.charges({}).subscribe((resp: any) => {
      const data = resp?.content ?? [];

      this.chargesArray.clear();

      data.forEach((c: any) => {
        this.chargesArray.push(this.createChargeForm(c));
      });
    });
  }

  addNewRow() {
    const hasNew = this.chargesArray.value.some((c: any) => c.isNew);

    if (hasNew) return;

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

  calculateTotal(index: number) {
    const group = this.chargesArray.at(index);

    const amount = group.get('amount')?.value || 0;
    const vat = group.get('vat')?.value || 0;

    group.patchValue({
      total: amount + vat,
    });
  }

  saveRow(index?: number) {
    const formValue = this.chargesArray.value;
    console.log(formValue);
    const newIndex = formValue.findIndex((c: any) => c.isNew);
    console.log(newIndex);
    if (newIndex !== -1) {
      const payload = {
        description: formValue[newIndex]?.description,
        amount: formValue[newIndex]?.amount,
        tax_code: formValue[newIndex]?.tax_code,
      };
      this.showSave = false;
      console.log(payload);
      this.chargesService.addCharge(payload).subscribe(() => {
        this.getCharges();
      });
    }

    if (index !== undefined) {
      const row = this.chargesArray.at(index).value;

      this.chargesService.editCharge(row.charge_id).subscribe(() => {
        this.chargesArray.at(index).patchValue({ isEdit: false });
      });
    }
  }

  deleteRow(index: number) {
    const row = this.chargesArray.at(index).value;

    if (row.id) {
      this.chargesService.deleteCharge(row.id).subscribe(() => {
        this.getCharges();
      });
    } else {
      this.chargesArray.removeAt(index);
    }
  }
}
