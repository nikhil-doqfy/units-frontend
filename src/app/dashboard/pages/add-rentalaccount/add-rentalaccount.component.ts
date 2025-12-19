import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { PageChange, PageSizeChange } from '../../../shared/model/shared.model';
import { SharedService } from '../../../shared.service';
import { PlusIconComponent } from '../../../shared/component/icons/plus-icon/plus-icon.component';
import { TableTitleComponent } from '../../component/table-title/table-title.component';
import { TableSelectComponent } from '../../component/table-select/table-select.component';
import { TablePaginationComponent } from '../../component/table-pagination/table-pagination.component';
import { TableFilterButtonComponent } from '../../component/table-filter-btn/table-filter-btn.component';
import { Subscription } from 'rxjs';
import { UploadIconComponent } from '../../component/icons/upload-icon/upload-icon.component';

@Component({
  selector: 'app-add-rentalaccount',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PlusIconComponent,
    TableTitleComponent,
    TableSelectComponent,
    TablePaginationComponent,
    TableFilterButtonComponent,
    UploadIconComponent,
  ],
  templateUrl: './add-rentalaccount.component.html',
  styleUrl: './add-rentalaccount.component.css',
})
export class AddRentalaccountComponent implements OnInit {
  private sharedService = inject(SharedService);

  constructor(private modalService: NgbModal, private router: Router) {}

  isEditMode = false;
  showDetailView = false;
  isCash = false;
  private showDetailSubscription!: Subscription;
  ngOnInit(): void {
    this.showDetailSubscription = this.sharedService.showDetail$.subscribe(
      (value: boolean) => {
        this.showDetailView = value;
        console.log('showDetailView updated:', value);
      }
    );
  }

  componentName = 'RentalComponent';
  totalRecords = 0;
  rowsPerPageOptions = [10, 25, 50, 100];
  rowsPerPage = 10;
  currentPage = 1;

  tenant: any;
  leaseList: any;
  leaseStatus: any;
  selectedleasestatus: any;

  charges = [
    {
      label: 'Admin Fee',
      amount: 32.71,
      tax: 'VAT @5%',
      vat: 1.64,
      total: 34.35,
      checked: true,
    },
    {
      label: 'Ejari Charge Disbursement',
      amount: 175.65,
      tax: 'VAT @Nil',
      vat: 0,
      total: 175.65,
      checked: true,
    },
    {
      label: 'Gas Charges',
      amount: 1000,
      tax: 'VAT @5%',
      vat: 50,
      total: 1050,
      checked: true,
    },
    {
      label: 'COMMISSION- DUBAI',
      amount: 1200,
      tax: 'VAT @5%',
      vat: 60,
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

  onEdit() {
    this.isEditMode = true;
  }

  onSaveChanges() {
    this.sharedService.showDetails();
    console.log('Saved changes!');
  }

  openAddChargesModal(content: any) {
    this.modalService.open(content, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
  }

  addCharge(modal: any) {
    this.isEditMode = true;
    console.log('Charge Added');
    modal.close();
  }

  onAddCheques() {
    this.isEditMode = true;
  }

  onClose() {
    this.isEditMode = false;
  }

  onPaymentToggle(event: Event) {
    this.isCash = (event.target as HTMLInputElement).checked;
  }

  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
  }

  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
  }

  onRefresh() {}

  get totalAmount(): number {
    return this.charges
      .filter((c) => c.checked)
      .reduce((sum, c) => sum + c.total, 0);
  }

  handleBackClick() {
    throw new Error('Method not implemented.');
  }
}
