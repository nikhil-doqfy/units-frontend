import {
  Component,
  inject,
  signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { WhiteCardComponent } from '../../shared/component/white-card/white-card.component';
import { PlusIconComponent } from '../../shared/component/icons/plus-icon/plus-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { EmailIconComponent } from '../../auth/component/icons/email-icon/email-icon.component';
import { CallIconComponent } from './icons/call-icon/call-icon.component';
import { CallIconsNewComponent } from '../../icons/call-icons-new/call-icons-new.component';
import { WhatsappIconComponent } from '../../icons/whatsapp-icon/whatsapp-icon.component';
import { CommonModule } from '@angular/common';
import { AllLeadsComponent } from './all-leads/all-leads.component';
import { EmailLeadsComponent } from './email-leads/email-leads.component';
import { WhatsappLeadsComponent } from './whatsapp-leads/whatsapp-leads.component';
import { CallLeadsComponent } from './call-leads/call-leads.component';
import { AddNewLeadsComponent } from './forms/add-new-leads/add-new-leads.component';
import {
  ModalDismissReasons,
  NgbActiveModal,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AlertService } from '../../shared/services/alert.service';

@Component({
  selector: 'app-property-leads',
  standalone: true,
  imports: [
    WhiteCardComponent,
    PlusIconComponent,
    TranslateModule,
    EmailIconComponent,
    CallIconsNewComponent,
    WhatsappIconComponent,
    CommonModule,
    AllLeadsComponent,
    EmailLeadsComponent,
    WhatsappLeadsComponent,
    CallLeadsComponent,
    AddNewLeadsComponent,
  ],
  templateUrl: './property-leads.component.html',
  styleUrl: './property-leads.component.css',
})
export class PropertyLeadsComponent {
  private modalService = inject(NgbModal);
  private router = inject(Router);
  private alertService = inject(AlertService);
  closeResult: WritableSignal<string> = signal('');

  selectedLead: any = null;
  activeLeadTab: string = 'all';
  isEditMode: boolean = false;

  openAddLeadModal(
    addLeadContent: TemplateRef<any>,
    editMode: boolean = false
  ) {
    this.isEditMode = editMode;
    this.modalService
      .open(addLeadContent, {
        ariaLabelledBy: 'modal-title',
        windowClass: 'mdlCommon',
        centered: true,
      })
      .result.then(
        (result) => {
          this.closeResult.set(`Closed with: ${result}`);
        },
        (reason) => {
          this.closeResult.set(`Dismissed ${this.getDismissReason(reason)}`);
        }
      );
  }
  private getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.ESC:
        return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK:
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }
  onUserSave(success: boolean, modal: NgbActiveModal) {
    if (success) {
      this.alertService.success('Lead saved successfully');
      modal.close();
      this.router.navigate(['/dashboard/leads']);
    } else {
      this.alertService.error('Failed to save lead');
    }
  }
}
