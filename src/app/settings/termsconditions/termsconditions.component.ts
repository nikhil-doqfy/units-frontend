import { Component, DestroyRef, inject } from '@angular/core';
import { WhiteCardComponent } from '../../shared/component/white-card/white-card.component';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EditIconComponent } from '../../user/component/icons/edit-icon/edit-icon.component';
import { BreadCrumb } from '../../shared/model/shared.model';
import { SharedService } from '../../shared.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-termsconditions',
  standalone: true,
  imports: [
    WhiteCardComponent,
    CommonModule,
    TranslateModule,
    EditIconComponent,
  ],
  templateUrl: './termsconditions.component.html',
  styleUrl: './termsconditions.component.css',
})
export class TermsconditionsComponent {
  currentLanguage = 'en';
  activeTab: string = 'login';

  private destroyRef = inject(DestroyRef);
  private translate = inject(TranslateService);
  ngOnInit() {
    this.loadBreadcrumb();
  }
  showDetailView: boolean = false;

  private sharedService = inject(SharedService);
  breadcrumbData: BreadCrumb[] = [];

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
        {
          label: 'PAGE_TITLE.PROPERTIES',
          link: '/dashboard/Terms & Conditions',
        },
        { label: 'PROPERTY_DETAILS', link: '' },
      ]);
    } else {
      this.setBreadCrumb([
        { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
        { label: 'PAGE_TITLE.TERMS_AND_CONDITIONS', link: '' },
      ]);
    }
  }
  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }
}
