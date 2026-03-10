import { Component, EventEmitter, Output } from '@angular/core';
import { AllPropertiesComponent } from '../../component/all-properties/all-properties.component';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { CommonModule } from '@angular/common';
import { UserRole } from '../../../theme.service';
import { TranslateModule } from '@ngx-translate/core';
import { RejectedTenantComponent } from '../rejected-tenant/rejected-tenant.component';
import { PastTenantComponent } from '../past-tenant/past-tenant.component';
import { CurrentTenantComponent } from '../current-tenant/current-tenant.component';
import { ActiveTenantTabComponent } from '../active-tenant-tab/active-tenant-tab.component';

@Component({
  selector: 'app-active-tenant',
  standalone: true,
  imports: [
    WhiteCardComponent,
    CommonModule,
    TranslateModule,
    RejectedTenantComponent,
    PastTenantComponent,
    CurrentTenantComponent,
    ActiveTenantTabComponent,
  ],
  templateUrl: './active-tenant.component.html',
  styleUrl: './active-tenant.component.css',
})
export class ActiveTenantComponent {
  @Output() detailViewChanges = new EventEmitter<boolean>();

  currentRole: UserRole = 'property-manager';
  activeTenantTab: string = 'currenttenant';
  isUnitDetailView: boolean = false;
  onUnitDetailChanges(event: boolean) {
    this.isUnitDetailView = event;
  }
}
