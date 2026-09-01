import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChildren,
  QueryList,
  ElementRef,
  ContentChild,
  output,
  HostListener,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { BackIconComponent } from '../icons/back-icon/back-icon.component';
import { EditIconComponent } from '../../../user/component/icons/edit-icon/edit-icon.component';
import { TableActionButtonComponent } from '../table-action-btn/table-action-btn.component';
import { TranslateModule } from '@ngx-translate/core';
import { DownloadIconComponent } from '../../../icons/download-icon/download-icon.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CircularCrossBtnIconComponent } from '../../../icons/circular-cross-btn-icon/circular-cross-btn-icon.component';
import { ArrowDownIconComponent } from '../../../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
import { WhatsappShareIconComponent } from '../../../icon/whatsapp-share-icon/whatsapp-share-icon.component';
import { ArrowUpIconComponent } from '../../../shared/component/icons/arrow-up-icon/arrow-up-icon.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TenantsService } from '../../services/tenants.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-table-view-card',
  standalone: true,
  imports: [
    CommonModule,
    BackIconComponent,
    EditIconComponent,
    TranslateModule,
    DownloadIconComponent,
    FormsModule,
    ReactiveFormsModule,
    CircularCrossBtnIconComponent,
    ArrowDownIconComponent,
    WhatsappShareIconComponent,
    ArrowUpIconComponent,
    NgbDropdownModule,
  ],
  templateUrl: './table-view-card.component.html',
  styleUrls: ['./table-view-card.component.css'],
})
export class TableViewCardComponent {
  @Input() leaseId: number | null = null;
  @Input() showBack: boolean = true;
  @Input() showImage: boolean = true;
  @Input() showCloseBtn: boolean = true;
  @Input() title!: string;
  @Input() imgSrc?: string;
  @Input() headerItems: { label: string; value: string }[] = [];
  @Input() items: { label: string; value: string; link?: string }[] = [];
  @Input() showEdit: boolean = false;
  @Input() showDownload: boolean = false;
  @Input() showShare: boolean = false;
  @Input() showApprovalActions: boolean = false;
  @Output() download = new EventEmitter<string>();
  @Output() share = new EventEmitter<any>();
  @Output() edit = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @ContentChildren(TableActionButtonComponent)
  projectedButtons!: QueryList<TableActionButtonComponent>;
  hasProjectedContent = false;
  @ContentChild('[rental]', { static: false }) rentalContent!: any;
  @ContentChild('extraSection', { read: ElementRef })
  extraSection!: ElementRef;
  openShare = false;
  hasExtraSection = false;
  showMenu = false;
  shareOptions = {
    whatsapp: true,
    mail: true,
    sms: false,
  };
  constructor(
    private eRef: ElementRef,
    private tenantService: TenantsService,
    private alertService: AlertService,
  ) {}

  ngAfterContentInit() {
    this.hasProjectedContent = this.projectedButtons.length > 0;
    return !!this.rentalContent;
  }

  get titleInitial(): string {
    return this.title ? this.title.charAt(0).toUpperCase() : '';
  }
  onCloseClick() {
    this.close.emit();
  }
  onEditClick() {
    this.edit.emit();
  }

  onBackClick() {
    this.back.emit();
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  onRenew() {
    this.showMenu = false;
    console.log('Renew Rental clicked');
  }

  onTerminate() {
    this.showMenu = false;
    console.log('Terminate Rental clicked');
  }
  handleRejectClick() {}
  handleApproveClick() {}

  toggleShare() {
    this.openShare = !this.openShare;
  }

  shareSelected() {
    console.log('Received leaseId:', this.leaseId);

    if (!this.leaseId) {
      console.error('lease_id is missing');
      return;
    }

    const payload = {
      lease_id: this.leaseId,
    };

    console.log('Share API Payload:', payload);

    this.tenantService.shareInvoice(payload).subscribe({
      next: (response) => {
        console.log('Invoice shared successfully:', response);
        this.alertService.success('Invoice sent successfully');
        this.share.emit(this.shareOptions);
        this.openShare = false;
      },
      error: (error) => {
        console.error('Invoice share failed:', error);
      },
    });
  }
  closeShare() {
    this.openShare = false;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.openShare = false;
    }
  }
}
