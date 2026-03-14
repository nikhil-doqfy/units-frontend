import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SharedService } from '../../../shared.service';
import { BreadCrumb } from '../../../shared/model/shared.model';
import { FormRenderComponent } from '../../../newtenant/component/form-render/form-render.component';
import { NewTenantFromService } from '../../../newtenant/component/service/new-tenant-from.service';
import { LeadsService } from '../../services/leads.service';

@Component({
  selector: 'app-new-tenant',
  standalone: true,
  imports: [CommonModule, FormRenderComponent],
  templateUrl: './new-tenant.component.html',
  styleUrl: './new-tenant.component.css',
})
export class NewTenantComponent {
  private destroyRef = inject(DestroyRef);
  private translate = inject(TranslateService);
  private newTenantService = inject(NewTenantFromService);
  private sharedService = inject(SharedService);
  private leadsService = inject(LeadsService);
  private route = inject(ActivatedRoute);

  steps = this.newTenantService.PropertySteps(null);
  activeIndex = this.newTenantService.getActiveIndex();
  loading = signal(false);
  breadcrumbData: BreadCrumb[] = [];

  constructor() {}

  ngOnInit() {
    this.loadBreadcrumb();
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadBreadcrumb());

    // Resolve lead_id from query params or navigation state
    const leadId =
      this.route.snapshot.queryParamMap.get('lead_id') ??
      history.state?.leadData?.id ??
      null;

    if (leadId) {
      this.loading.set(true);
      this.leadsService
        .getLeadById(leadId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resp: any) => {
            const leadData = resp?.content ?? null;
            this.steps = this.newTenantService.PropertySteps(leadData);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
    }
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
