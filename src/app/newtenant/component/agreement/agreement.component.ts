import { Component } from '@angular/core';
import { CustomSelectComponent } from '../../../dashboard/component/custom-select/custom-select.component';
import { AcceptIconComponent } from '../../../dashboard/component/icons/accept-icon/accept-icon.component';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { NewTenantFromService } from '../service/new-tenant-from.service';
import { WarningIconComponent } from '../../../icons/warning-icon/warning-icon.component';
import { CommonModule } from '@angular/common';
import { SignedSuccessfullyIconComponent } from '../../../icons/signed-successfully-icon/signed-successfully-icon.component';

@Component({
  selector: 'app-agreement',
  standalone: true,
  imports: [
    CustomSelectComponent,
    CommonModule,
    AcceptIconComponent,
    WhiteCardComponent,
    WarningIconComponent,
    SignedSuccessfullyIconComponent,
  ],
  templateUrl: './agreement.component.html',
  styleUrl: './agreement.component.css',
})
export class AgreementComponent {
  constructor(private formService: NewTenantFromService) { }
  showMsg$ = this.formService.getShowMsg();
  msgText$ = this.formService.getMsgText();
  ngOnInit(): void {
    this.formService.startAgreementFlow();
  }
}
