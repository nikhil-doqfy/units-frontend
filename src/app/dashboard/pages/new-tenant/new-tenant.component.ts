import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../shared.service';
import { BreadCrumb } from '../../../shared/model/shared.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StepSchema } from '../../model/step-engine/step-schema';
import { NewTenant } from '../../../newtenant/component/modules/new-tenant';
import { FormRenderComponent } from '../../../newtenant/component/form-render/form-render.component';
import { NewTenantFromService } from '../../../newtenant/component/service/new-tenant-from.service';

@Component({
  selector: 'app-new-tenant',
  standalone: true,
  imports: [CommonModule, FormRenderComponent],
  templateUrl: './new-tenant.component.html',
  styleUrl: './new-tenant.component.css',
})
export class NewTenantComponent {
  // private destroyRef = inject(DestroyRef);
  // private translate = inject(TranslateService);
  // private newTenantService = inject(NewTenantFromService);

  // showDetailView: boolean = false;

  // private sharedService = inject(SharedService);
  // breadcrumbData: BreadCrumb[] = [];
  // steps = this.newTenantService.PropertySteps();
  // activeIndex = this.newTenantService.getActiveIndex();

  // constructor() {}

  // ngOnInit() {
  //   this.loadBreadcrumb();
  //   this.initLanguageListener();
  // }
  // loadBreadcrumb() {
  //   if (this.showDetailView) {
  //     this.setBreadCrumb([
  //       { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
  //       { label: 'PAGE_TITLE.PROPERTIES', link: '/dashboard/new-tenant' },
  //       { label: 'PROPERTY_DETAILS', link: '' },
  //     ]);
  //   } else {
  //     this.setBreadCrumb([
  //       { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
  //       { label: 'PAGE_TITLE.NEW_TENANT', link: '' },
  //     ]);
  //   }
  // }
  // setBreadCrumb(breadCrumb: BreadCrumb[]) {
  //   this.sharedService
  //     .getBreadcrumbs(breadCrumb)
  //     .subscribe((data) => (this.breadcrumbData = data));
  // }

  // initLanguageListener() {
  //   this.translate.onLangChange
  //     .pipe(takeUntilDestroyed(this.destroyRef))
  //     .subscribe(() => {
  //       this.loadBreadcrumb();
  //     });
  // }
  private destroyRef = inject(DestroyRef);
  private translate = inject(TranslateService);
  private newTenantService = inject(NewTenantFromService);
  private sharedService = inject(SharedService);

  steps = this.newTenantService.PropertySteps(); // signal
  activeIndex = this.newTenantService.getActiveIndex(); // signal

  showDetailView: boolean = false;
  breadcrumbData: BreadCrumb[] = [];

  ngOnInit() {
    this.loadBreadcrumb();
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadBreadcrumb());
  }

  loadBreadcrumb() {
    this.setBreadCrumb([
      { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
      { label: 'PAGE_TITLE.NEW_TENANT', link: '' },
    ]);
  }

  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }
}
