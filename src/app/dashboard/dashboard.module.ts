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
import { OwnerDetailComponent } from './pages/owner-detail/owner-detail.component';
import { ApprovalComponent } from './pages/approval/approval.component';
import { UsersComponent } from './pages/users/users.component';
import { StaffComponent } from './pages/staff/staff.component';
import { RolesAndPermissionsComponent } from './pages/roles-and-permissions/roles-and-permissions.component';
import { DocumentationsComponent } from './pages/documentations/documentations.component';
import { PaymentsAndInvoiceComponent } from './pages/payments-and-invoice/payments-and-invoice.component';
import { PayMyDuesComponent } from './pages/pay-my-dues/pay-my-dues.component';
import { RaiseComplaintComponent } from './pages/raise-complaint/raise-complaint.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { RentalComponent } from './pages/rental/rental.component';
import { AddRentalaccountComponent } from './pages/add-rentalaccount/add-rentalaccount.component';
import { ComplaintsComponent } from './pages/complaints/complaints.component';
import { authGuard } from '../auth.guard';
import { permissionGuard } from '../permission.guard';
import { PropertyLeadsComponent } from './component/property-leads.component';
import { InvoiceTemplateComponent } from '../shared/invoice-template/invoice-template.component';
import { ChequesComponent } from './pages/cheques/cheques.component';
import { AnnouncementsComponent } from './pages/announcements/announcements.component';
import { LeadsComponent } from './pages/leads/leads.component';
import { PropertyDetailComponent } from './pages/property-detail/property-detail.component';
import { NewTenantComponent } from './pages/new-tenant/new-tenant.component';
import { UnitsComponent } from './pages/units/units.component';
import { NewUnitsComponent } from './pages/new-units/new-units.component';
import { UnitDetailComponent } from './pages/unit-detail/unit-detail.component';
import { BasicpersonalComponent } from '../newtenant/component/basicpersonal/basicpersonal.component';
import { SearchContactComponent } from '../shared/search-contact/search-contact.component';
export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        title: 'Dashboard | Units',
        pathMatch: 'full',
      },

      {
        path: 'home',
        component: HomeComponent,
        data: { titleKey: 'PAGE_TITLE.DASHBOARD' },
        canActivate: [authGuard],
      },
      {
        path: 'properties',
        component: PropertiesComponent,
        data: { titleKey: 'PAGE_TITLE.PROPERTIES', module: 'Properties' },
        canActivate: [permissionGuard],
      },
      {
        path: 'leads',
        component: LeadsComponent,
        data: { titleKey: 'PAGE_TITLE.LEADS', module: 'Lead' },
        canActivate: [permissionGuard],
      },
      {
        path: 'search-tenant',
        component: SearchContactComponent,
        data: { titleKey: 'PAGE_TITLE.PROPERTIES', module: 'Lead' },
        canActivate: [permissionGuard],
      },
      {
        path: 'add-property',
        component: AddPropertyComponent,
        data: { titleKey: 'PAGE_TITLE.ADD_PROPERTY', module: 'Properties' },
        canActivate: [permissionGuard],
      },
      {
        path: 'units',
        component: UnitsComponent,
        data: { titleKey: 'PAGE_TITLE.UNITS', module: 'Properties' },
        canActivate: [permissionGuard],
      },
      {
        path: 'new-units',
        component: NewUnitsComponent,
        data: { titleKey: 'PAGE_TITLE.NEW_UNITS', module: 'Properties' },
        canActivate: [permissionGuard],
      },
      {
        path: 'new-units/:id',
        component: NewUnitsComponent,
        data: { titleKey: 'PAGE_TITLE.NEW_UNITS', module: 'Properties' },
        canActivate: [permissionGuard],
      },
      {
        path: 'units/:id',
        component: UnitDetailComponent,
        data: { titleKey: 'PAGE_TITLE.NEW_UNITS', module: 'Properties' },
        canActivate: [permissionGuard],
      },
      {
        path: 'edit-property/:id',
        component: AddPropertyComponent,
        data: { titleKey: 'PAGE_TITLE.EDIT_PROPERTY', module: 'Properties' },
        canActivate: [permissionGuard],
      },
      {
        path: 'property/details/:id',
        component: PropertiesComponent,
        data: { titleKey: 'PAGE_TITLE.PROPERTIES', module: 'Properties' },
        canActivate: [permissionGuard],
      },
      {
        path: 'properties/:id',
        component: PropertyDetailComponent,
        data: { titleKey: 'PAGE_TITLE.PROPERTIES', module: 'Properties' },
        canActivate: [permissionGuard],
      },
      {
        path: 'pmc',
        component: PMCComponent,
        data: { titleKey: 'PAGE_TITLE.PMC' },
      },
      {
        path: 'pmc/detail/:id',
        component: PMCComponent,
        data: { titleKey: 'PAGE_TITLE.PMC' },
      },
      {
        path: 'tenants',
        component: TenantsComponent,
        data: { titleKey: 'PAGE_TITLE.TENANTS', module: 'Tenant' },
        canActivate: [permissionGuard],
      },
      {
        path: 'new-tenant',
        component: NewTenantComponent,
        data: { titleKey: 'PAGE_TITLE.NEW_TENANT', module: 'Tenant' },
        canActivate: [permissionGuard],
      },
      {
        path: 'tenants/detail/:id',
        component: TenantsComponent,
        data: { titleKey: 'PAGE_TITLE.TENANTS', module: 'Tenant' },
        canActivate: [permissionGuard],
      },
      {
        path: 'cheques',
        component: ChequesComponent,
        data: { titleKey: 'PAGE_TITLE.CHEQUES', module: 'Cheque' },
        canActivate: [permissionGuard],
      },
      {
        path: 'lease-tenancy',
        component: LeaseTenancyComponent,
        data: { titleKey: 'PAGE_TITLE.LEASE', module: 'Rental Portfolio' },
        canActivate: [permissionGuard],
      },
      {
        path: 'add-lease',
        component: AddLeaseComponent,
        data: { titleKey: 'PAGE_TITLE.ADD_LEASE', module: 'Rental Portfolio' },
        canActivate: [permissionGuard],
      },
      {
        path: 'edit-lease/:id',
        component: AddLeaseComponent,
        data: { titleKey: 'PAGE_TITLE.EDIT_LEASE', module: 'Rental Portfolio' },
        canActivate: [permissionGuard],
      },
      {
        path: 'rental',
        component: RentalComponent,
        data: {
          titleKey: 'PAGE_TITLE.RENTAL_PORTFOLIO',
          module: 'Rental Portfolio',
        },
        canActivate: [permissionGuard],
      },
      {
        path: 'add-rentalaccount',
        component: AddRentalaccountComponent,
        data: { titleKey: 'PAGE_TITLE.ADD', module: 'Rental Portfolio' },
        canActivate: [permissionGuard],
      },
      {
        path: 'invoice-template',
        component: InvoiceTemplateComponent,
        data: { titleKey: 'PAGE_TITLE.INVOICE_TEMPLATE' },
      },
      {
        path: 'complaints',
        component: ComplaintsComponent,
        data: { titleKey: 'PAGE_TITLE.COMPLAINTS', module: 'Complaints' },
        canActivate: [permissionGuard],
      },
      {
        path: 'complaints/detail/:code',
        component: ComplaintsComponent,
        data: { titleKey: 'PAGE_TITLE.COMPLAINTS', module: 'Complaints' },
        canActivate: [permissionGuard],
      },
      {
        path: 'announcements',
        component: AnnouncementsComponent,
        data: { titleKey: 'PAGE_TITLE.BROADCAST', module: 'Broadcast' },
        canActivate: [permissionGuard],
      },
      {
        path: 'owners',
        component: OwnersComponent,
        data: { titleKey: 'PAGE_TITLE.OWNERS', module: 'Owner' },
        canActivate: [permissionGuard],
      },
      {
        path: 'owners/detail/:owner_id',
        component: OwnerDetailComponent,
        data: { titleKey: 'PAGE_TITLE.OWNERS', module: 'Owner' },
        canActivate: [permissionGuard],
      },
      {
        path: 'approval',
        component: ApprovalComponent,
        data: { titleKey: 'PAGE_TITLE.APPROVAL', module: 'Approval' },
        canActivate: [permissionGuard],
      },
      {
        path: 'approval/detail/:tenant_id',
        component: ApprovalComponent,
        data: { titleKey: 'PAGE_TITLE.APPROVAL', module: 'Approval' },
        canActivate: [permissionGuard],
      },
      {
        path: 'staff',
        component: StaffComponent,
        data: { titleKey: 'PAGE_TITLE.TEAM', module: 'Team' },
        canActivate: [permissionGuard],
      },
      {
        path: 'staff/detail/:staff_id',
        component: StaffComponent,
        data: { titleKey: 'PAGE_TITLE.STAFF', module: 'Team' },
        canActivate: [permissionGuard],
      },
      {
        path: 'users',
        component: UsersComponent,
        data: { titleKey: 'PAGE_TITLE.USERS', module: 'Users' },
        canActivate: [permissionGuard],
      },
      {
        path: 'roles-and-permissions',
        component: RolesAndPermissionsComponent,
        data: {
          titleKey: 'PAGE_TITLE.ROLES_PERMISSIONS',
          module: 'Roles and Permission',
        },
        canActivate: [permissionGuard],
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
        path: 'raise-complaint/detail',
        component: RaiseComplaintComponent,
        data: { titleKey: 'PAGE_TITLE.SUPPORT' },
      },
      {
        path: 'raise-complaint',
        component: RaiseComplaintComponent,
        data: { titleKey: 'PAGE_TITLE.SUPPORT' },
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
