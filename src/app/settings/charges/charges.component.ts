import { Component, DestroyRef, inject } from '@angular/core';
import { WhiteCardComponent } from '../../shared/component/white-card/white-card.component';
import { CommonModule } from '@angular/common';
import { TableTitleComponent } from '../../dashboard/component/table-title/table-title.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { PlusIconComponent } from '../../shared/component/icons/plus-icon/plus-icon.component';
import { EditIconComponent } from '../../dashboard/component/icons/edit-icon/edit-icon.component';
import { DeleteIconComponent } from '../../dashboard/component/icons/delete-icon/delete-icon.component';
import { SaveIconComponent } from '../../icons/save-icon/save-icon.component';
import { BreadCrumb } from '../../shared/model/shared.model';
import { SharedService } from '../../shared.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
export interface Charge {
  label: string;
  amount: number | null;
  tax: string;
  vat: number | null;
  editable?: boolean;
  total: number | null;
  checked: boolean;
  isNew?: boolean;
}
@Component({
  selector: 'app-charges',
  standalone: true,
  imports: [
    WhiteCardComponent,
    CommonModule,
    TableTitleComponent,
    TranslateModule,
    CommonModule,
    FormsModule,
    PlusIconComponent,
    EditIconComponent,
    DeleteIconComponent,
    SaveIconComponent,
  ],
  templateUrl: './charges.component.html',
  styleUrl: './charges.component.css',
})
export class ChargesComponent {
  private destroyRef = inject(DestroyRef);
  private translate = inject(TranslateService);
  private sharedService = inject(SharedService);

  currentLanguage = 'en';
  showSave = false;
  showDetailView: boolean = false;
  breadcrumbData: BreadCrumb[] = [];

  charges: Charge[] = [
    {
      label: 'Admin Fee',
      amount: 32.71,
      tax: 'VAT @5%',
      vat: 1.64,
      editable: true,
      total: 34.35,
      checked: true,
    },
    {
      label: 'Ejari Charge Disbursement',
      amount: 175.65,
      tax: 'VAT @Nil',
      vat: 0,
      editable: true,
      total: 175.65,
      checked: true,
    },
    {
      label: 'Gas Charges',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      editable: true,
      total: 1050,
      checked: true,
    },
    {
      label: 'COMMISSION- DUBAI',
      amount: 1200,
      tax: 'VAT @5%',
      vat: 60,
      editable: false,
      total: 1260,
      checked: true,
    },
    {
      label: 'Security Deposit',
      amount: 2400,
      tax: 'VAT @Nil',
      vat: 0,
      total: 2400,
      checked: true,
    },
    {
      label: 'CAR PARKING',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: true,
    },
    {
      label: 'TAWTHEEQ REGISTRATION A/C...',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: true,
    },
    {
      label: 'RENEWAL COMMISSION (DUBAI)',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: false,
    },
    {
      label: 'RENEWAL COMMISSION (SHARJ...)',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: false,
    },
    {
      label: 'R COMMISSION- ABU DHABI BL...',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: false,
    },
    {
      label: 'TAWTHEEQ SERVICE INCOME- A...',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: false,
    },
  ];

  ngOnInit() {
    this.loadBreadcrumb();
  }

  addNewRow() {
    this.showSave = true;

    this.charges.unshift({
      label: '',
      amount: null,
      tax: '',
      vat: null,
      editable: false,
      total: null,
      checked: true,
      isNew: true,
    });
  }

  deleteRow(i: number) {
    this.charges.splice(i, 1);
  }

  calculateTotal(c: Charge) {
    if (c.amount != null) {
      const vat = c.vat || 0;
      c.total = +c.amount + +vat;
    }
  }
  saveRow() {
    const index = this.charges.findIndex((c) => c.isNew);
    if (index === -1) return;

    const row = this.charges[index];

    row.isNew = false;

    this.charges.splice(index, 1);

    this.charges.push(row);

    this.showSave = false;
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
}
