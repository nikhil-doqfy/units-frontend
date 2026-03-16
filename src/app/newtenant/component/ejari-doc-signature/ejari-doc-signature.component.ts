import { Component, Input } from '@angular/core';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NewTenantFromService } from '../service/new-tenant-from.service';
import { WarningIconComponent } from '../../../icons/warning-icon/warning-icon.component';
import { CommonModule } from '@angular/common';
import { SignedSuccessfullyIconComponent } from '../../../icons/signed-successfully-icon/signed-successfully-icon.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-ejari-doc-signature',
  standalone: true,
  imports: [
    WhiteCardComponent,
    ReactiveFormsModule,
    WarningIconComponent,
    CommonModule,
    SignedSuccessfullyIconComponent,
    TranslateModule,
  ],
  templateUrl: './ejari-doc-signature.component.html',
  styleUrl: './ejari-doc-signature.component.css',
})
export class EjariDocSignatureComponent {
  @Input() form!: FormGroup;
  constructor(private formService: NewTenantFromService) {}
  msgText$ = this.formService.getMsgText();
  showMsg$ = this.formService.getShowMsg();

  ngOnInit() {
    this.formService.ejariDoc();
  }
}
