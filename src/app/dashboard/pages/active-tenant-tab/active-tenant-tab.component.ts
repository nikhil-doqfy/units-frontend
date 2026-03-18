import { Component, EventEmitter, Output, output } from '@angular/core';
import { UserRole } from '../../../theme.service';
import { RejectedTenantComponent } from '../rejected-tenant/rejected-tenant.component';
import { PastTenantComponent } from '../past-tenant/past-tenant.component';
import { CurrentTenantComponent } from '../current-tenant/current-tenant.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';

@Component({
  selector: 'app-active-tenant-tab',
  standalone: true,
  imports: [
    RejectedTenantComponent,
    PastTenantComponent,
    CurrentTenantComponent,
    CommonModule,
    TranslateModule,
    WhiteCardComponent,
  ],
  templateUrl: './active-tenant-tab.component.html',
  styleUrl: './active-tenant-tab.component.css',
})
export class ActiveTenantTabComponent {
  @Output() detailViewChanges = new EventEmitter<boolean>();

  currentRole: UserRole = 'property-manager';
  activeTenantTab: string = 'currenttenant';
  isUnitDetailView: boolean = false;
  onUnitDetailChanges(event: boolean) {
    this.isUnitDetailView = event;
    this.detailViewChanges.emit(event);
  }
}
