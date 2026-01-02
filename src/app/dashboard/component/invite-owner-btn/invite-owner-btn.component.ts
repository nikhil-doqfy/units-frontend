import {
  Component,
  DestroyRef,
  inject,
  signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { TableFilterButtonComponent } from '../table-filter-btn/table-filter-btn.component';
import { InviteIconComponent } from '../icons/invite-icon/invite-icon.component';
import {
  ModalDismissReasons,
  NgbActiveModal,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '../../../shared/services/alert.service';
import { TranslateModule } from '@ngx-translate/core';
import { SendIconComponent } from '../icons/send-icon/send-icon.component';
import { InviteOwnerFormComponent } from '../forms/invite-owner-form/invite-owner-form.component';
import { OwnerService } from '../../services/owner.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-invite-owner-btn',
  standalone: true,
  imports: [
    TableFilterButtonComponent,
    InviteIconComponent,
    TranslateModule,
    SendIconComponent,
    InviteOwnerFormComponent,
  ],
  templateUrl: './invite-owner-btn.component.html',
  styleUrl: './invite-owner-btn.component.css',
})
export class InviteOwnerBtnComponent {
  modalService = inject(NgbModal);
  private ownerService = inject(OwnerService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  closeResult: WritableSignal<string> = signal('');

  openInviteOwnerModal(inviteOwnerContent: TemplateRef<any>) {
    this.modalService
      .open(inviteOwnerContent, {
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

  sendInvite(
    inviteFormRef: InviteOwnerFormComponent,
    modal?: NgbActiveModal | any
  ) {
    const form = inviteFormRef.pmcOwnerForm;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    let payload = { email: form.value.email };
    this.ownerService
      .addOwnerToInvite(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.alertService.success(resp.message);
          modal?.close('Save click');
        },
      });
  }
}
