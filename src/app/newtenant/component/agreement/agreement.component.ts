import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { NewTenantFromService } from '../service/new-tenant-from.service';
import { LeaseService } from '../../../dashboard/services/lease.service';
import { WarningIconComponent } from '../../../icons/warning-icon/warning-icon.component';
import { SignedSuccessfullyIconComponent } from '../../../icons/signed-successfully-icon/signed-successfully-icon.component';

@Component({
  selector: 'app-agreement',
  standalone: true,
  imports: [
    CommonModule,
    WhiteCardComponent,
    WarningIconComponent,
    SignedSuccessfullyIconComponent,
  ],
  templateUrl: './agreement.component.html',
  styleUrl: './agreement.component.css',
})
export class AgreementComponent {
  private formService = inject(NewTenantFromService);
  private leaseService = inject(LeaseService);
  private sanitizer = inject(DomSanitizer);

  showMsg$ = this.formService.getShowMsg();
  msgText$ = this.formService.getMsgText();

  pdfUrl: SafeResourceUrl | null = null;
  pdfLoading = false;

  ngOnInit(): void {
    this.formService.startAgreementFlow();
    this.loadPdf();
  }

  private loadPdf() {
    const leaseId = this.formService.getLeaseId()();
    if (!leaseId) return;

    this.pdfLoading = true;
    this.leaseService.getLeaseById(leaseId).subscribe({
      next: (resp: any) => {
        const pdfUrl = resp?.content?.pdf_url;
        if (pdfUrl) {
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
        }
        this.pdfLoading = false;
      },
      error: () => { this.pdfLoading = false; },
    });
  }
}
