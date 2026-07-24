import {
  Component,
  DestroyRef,
  inject,
  signal,
  TemplateRef,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import {
  ModalDismissReasons,
  NgbActiveModal,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { EmailIconComponent } from '../../../auth/component/icons/email-icon/email-icon.component';
import { WhatsappIconComponent } from '../../../icons/whatsapp-icon/whatsapp-icon.component';
import { CallIconsNewComponent } from '../../../icons/call-icons-new/call-icons-new.component';
import { PlusIconComponent } from '../../../shared/component/icons/plus-icon/plus-icon.component';
import { AllLeadsComponent } from '../../component/all-leads/all-leads.component';
import { EmailLeadsComponent } from '../../component/email-leads/email-leads.component';
import { WhatsappLeadsComponent } from '../../component/whatsapp-leads/whatsapp-leads.component';
import { CallLeadsComponent } from '../../component/call-leads/call-leads.component';
import { AddNewLeadsComponent } from '../../component/forms/add-new-leads/add-new-leads.component';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../shared.service';
import { BreadCrumb } from '../../../shared/model/shared.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [
    WhiteCardComponent,
    EmailIconComponent,
    WhatsappIconComponent,
    CallIconsNewComponent,
    PlusIconComponent,
    AllLeadsComponent,
    EmailLeadsComponent,
    WhatsappLeadsComponent,
    CallLeadsComponent,
    AddNewLeadsComponent,
    CommonModule,
    TranslateModule,
  ],
  templateUrl: './leads.component.html',
  styleUrl: './leads.component.css',
})
export class LeadsComponent {
  private destroyRef = inject(DestroyRef);
  private translate = inject(TranslateService);
  private modalService = inject(NgbModal);
  closeResult: WritableSignal<string> = signal('');

  @ViewChild(AllLeadsComponent) allLeadsRef!: AllLeadsComponent;

  selectedLead: any = null;
  activeLeadTab: string = 'all';
  isEditMode: boolean = false;
  ngOnInit() {
    this.loadBreadcrumb();
  }
  private sharedService = inject(SharedService);
  private alertService = inject(AlertService);
  breadcrumbData: BreadCrumb[] = [];

  showDetailView: boolean = false;
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
        { label: 'PAGE_TITLE.PROPERTIES', link: '/dashboard/Leads' },
        { label: 'PROPERTY_DETAILS', link: '' },
      ]);
    } else {
      this.setBreadCrumb([
        { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
        { label: 'PAGE_TITLE.LEADS', link: '' },
      ]);
    }
  }
  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }
  openAddLeadModal(
    addLeadContent: TemplateRef<any>,
    editMode: boolean = false,
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
        },
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

      this.activeLeadTab = 'all';
      setTimeout(() => {
        this.allLeadsRef?.loadLeads();
      });
    } else {
      this.alertService.error('Failed to save lead');
    }
  }
}
