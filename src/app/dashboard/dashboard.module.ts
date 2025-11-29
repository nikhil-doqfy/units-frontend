import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { PropertiesComponent } from './pages/properties/properties.component';
import { AddPropertyComponent } from './pages/add-property/add-property.component';
import { PMCComponent } from './pages/pmc/pmc.component';
import { TenantsComponent } from './pages/tenants/tenants.component';
import { LeaseTenancyComponent } from './pages/lease-tenancy/lease-tenancy.component';
import { AddLeaseComponent } from './pages/add-lease/add-lease.component';
import { OwnersComponent } from './pages/owners/owners.component';
import { ApprovalComponent } from './pages/approval/approval.component';
import { UsersComponent } from './pages/users/users.component';
import { StaffComponent } from './pages/staff/staff.component';
import { RolesAndPermissionsComponent } from './pages/roles-and-permissions/roles-and-permissions.component';
import { DocumentationsComponent } from './pages/documentations/documentations.component';
import { PaymentsAndInvoiceComponent } from './pages/payments-and-invoice/payments-and-invoice.component';
import { PayMyDuesComponent } from './pages/pay-my-dues/pay-my-dues.component';
import { RaiseComplaintComponent } from './pages/raise-complaint/raise-complaint.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        title: 'Dashboard | Doqfy',
        pathMatch: 'full',
      },

      {
        path: 'home',
        component: HomeComponent,
        data: { titleKey: 'PAGE_TITLE.DASHBOARD' },
      },
      {
        path: 'properties',
        component: PropertiesComponent,
        data: { titleKey: 'PAGE_TITLE.PROPERTIES' },
      },
      {
        path: 'add-property',
        component: AddPropertyComponent,
        data: { titleKey: 'PAGE_TITLE.ADD_PROPERTY' },
      },
      {
        path: 'edit-property/:id',
        component: AddPropertyComponent,
        data: { titleKey: 'PAGE_TITLE.EDIT_PROPERTY' },
      },
      {
        path: 'property/details/:id',
        component: PropertiesComponent,
        data: { titleKey: 'PAGE_TITLE.PROPERTIES' },
      },
      {
        path: 'pmc',
        component: PMCComponent,
        data: { titleKey: 'PAGE_TITLE.PMC' },
      },
      {
        path: 'tenants',
        component: TenantsComponent,
        data: { titleKey: 'PAGE_TITLE.TENANTS' },
      },
      {
        path: 'tenants/detail/:id',
        component: TenantsComponent,
        data: { titleKey: 'PAGE_TITLE.TENANTS' },
      },
      {
        path: 'lease-tenancy',
        component: LeaseTenancyComponent,
        data: { titleKey: 'PAGE_TITLE.LEASE' },
      },
      {
        path: 'add-lease',
        component: AddLeaseComponent,
        data: { titleKey: 'PAGE_TITLE.ADD_LEASE' },
      },
      {
        path: 'owners',
        component: OwnersComponent,
        data: { titleKey: 'PAGE_TITLE.OWNERS' },
      },
      {
        path: 'owners/detail/:id',
        component: OwnersComponent,
        data: { titleKey: 'PAGE_TITLE.OWNERS' },
      },
      {
        path: 'approval',
        component: ApprovalComponent,
        data: { titleKey: 'PAGE_TITLE.APPROVAL' },
      },
      {
        path: 'staff',
        component: StaffComponent,
        data: { titleKey: 'PAGE_TITLE.STAFF' },
      },
      {
        path: 'staff/detail/:id',
        component: StaffComponent,
        data: { titleKey: 'PAGE_TITLE.STAFF' },
      },
      {
        path: 'users',
        component: UsersComponent,
        data: { titleKey: 'PAGE_TITLE.USERS' },
      },
      {
        path: 'roles-and-permissions',
        component: RolesAndPermissionsComponent,
        data: { titleKey: 'PAGE_TITLE.ROLES_PERMISSIONS' },
      },
      {
        path: 'documentations',
        component: DocumentationsComponent,
        data: { titleKey: 'PAGE_TITLE.DOCUMENTATIONS' },
      },
      {
        path: 'payments-and-invoice',
        component: PaymentsAndInvoiceComponent,
        data: { titleKey: 'PAGE_TITLE.PAYMENTS_INVOICE' },
      },
      {
        path: 'pay-my-dues',
        component: PayMyDuesComponent,
        data: { titleKey: 'PAGE_TITLE.PAY_MY_DUES' },
      },
      {
        path: 'raise-complaint',
        component: RaiseComplaintComponent,
        data: { titleKey: 'PAGE_TITLE.RAISE_COMPLAINT' },
      },
      {
        path: 'privacy-policy',
        component: PrivacyPolicyComponent,
        data: { titleKey: 'PAGE_TITLE.PRIVACY_POLICY' },
      },
    ],
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class DashboardModule {}
