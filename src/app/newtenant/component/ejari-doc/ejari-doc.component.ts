import { Component, Input } from '@angular/core';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { DownloadIconComponent } from '../../../icons/download-icon/download-icon.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NewTenantFromService } from '../service/new-tenant-from.service';
import { WarningIconComponent } from '../../../icons/warning-icon/warning-icon.component';

@Component({
  selector: 'app-ejari-doc',
  standalone: true,
  imports: [
    WhiteCardComponent,
    DownloadIconComponent,
    CommonModule,
    ReactiveFormsModule,
    WarningIconComponent,
  ],
  templateUrl: './ejari-doc.component.html',
  styleUrl: './ejari-doc.component.css',
})
export class EjariDocComponent {
  @Input() form!: FormGroup;
  constructor(private formService: NewTenantFromService) {}

  msgText$ = this.formService.getMsgText();
  showMsg$ = this.formService.getShowMsg();

  ngOnInit() {
    // Reset to a clean "ready to send" state whenever this step is
    // (re)entered -- otherwise a stale in-memory phase from an earlier
    // click this session (e.g. after navigating back) makes the Send for
    // Signature button silently do nothing.
    this.formService.ejariDoc();
  }
}
