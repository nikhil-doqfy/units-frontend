import {
  Component,
  DestroyRef,
  inject,
  signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ModalDismissReasons,
  NgbActiveModal,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';

import { TableFilterButtonComponent } from '../table-filter-btn/table-filter-btn.component';
import { InviteIconComponent } from '../icons/invite-icon/invite-icon.component';
import { InvitePMCFormComponent } from '../forms/invite-pmc-form/invite-pmc-form.component';
import { SendIconComponent } from '../icons/send-icon/send-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { PmcService } from '../../services/pmc.service';
import { AlertService } from '../../../shared/services/alert.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-invite-pmc-btn',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TableFilterButtonComponent,
    InviteIconComponent,
    InvitePMCFormComponent,
    SendIconComponent,
  ],
  templateUrl: './invite-pmc-btn.component.html',
  styleUrl: './invite-pmc-btn.component.css',
})
export class InvitePMCButtonComponent {
  private modalService = inject(NgbModal);
  private pmcService = inject(PmcService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  closeResult: WritableSignal<string> = signal('');

  openInvitePMCModal(invitePMCContent: TemplateRef<any>) {
    this.modalService
      .open(invitePMCContent, {
        ariaLabelledBy: 'modal-title',
        windowClass: 'mdlCommon mdlSmall',
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

  invitePmc(modal: NgbActiveModal, component: InvitePMCFormComponent) {
    const form = component.invitePmcForm;

    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    const values: any = form.value;

    const data = {
      email: values.email,
    };

    this.pmcService
      .addPmcToInvite(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp: any) => {
        this.alertService.success(resp.message);
        modal.close('Save click');
      });
  }
}
