import { Component, DestroyRef, inject } from '@angular/core';
import { SharedService } from '../../../shared.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MailIconComponent } from '../../../dashboard/component/icons/mail-icon/mail-icon.component';
import { CallIconComponent } from '../../../dashboard/component/icons/call-icon/call-icon.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sidebar-support',
  standalone: true,
  imports: [MailIconComponent, CallIconComponent, TranslateModule],
  templateUrl: './sidebar-support.component.html',
  styleUrl: './sidebar-support.component.css',
})
export class SidebarSupportComponent {
  private destroyRef = inject(DestroyRef);
  openSidebarValue = true;
  constructor(
    private sharedService: SharedService,
    private translate: TranslateService
  ) {
    translate.use('en');
  }

  ngOnInit() {
    this.sharedService.openSidebarValue$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.openSidebarValue = value;
      });
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }
}
