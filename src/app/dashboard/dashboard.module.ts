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
            { path: '', redirectTo: 'home', title: 'Dashboard | Doqfy', pathMatch: 'full' },

            { path: 'home', title: 'Dashboard | Doqfy', component: HomeComponent, data: { title: 'Dashboard' } },
            { path: 'properties', title: 'Properties | Doqfy', component: PropertiesComponent, data: { title: 'Properties' } },
            { path: 'add-property', title: 'Add Property | Doqfy', component: AddPropertyComponent, data: { title: 'Properties / Add Property' } },
            { path: 'pmc', title: 'PMC | Doqfy', component: PMCComponent, data: { title: 'PMC' } },
            { path: 'tenants', title: 'Tenants | Doqfy', component: TenantsComponent, data: { title: 'Tenants' } },
            { path: 'lease-tenancy', title: 'Lease | Doqfy', component: LeaseTenancyComponent, data: { title: 'Lease' } },
            { path: 'add-lease', title: 'Add Lease | Doqfy', component: AddLeaseComponent, data: { title: 'Lease / Add Lease' } },
            { path: 'owners', title: 'Owners | Doqfy', component: OwnersComponent, data: { title: 'Owners' } },
            { path: 'approval', title: 'Approvals | Doqfy', component: ApprovalComponent, data: { title: 'Approvals' } },
            { path: 'staff', title: 'Staff | Doqfy', component: StaffComponent, data: { title: 'Staff' } },
            { path: 'users', title: 'Users | Doqfy', component: UsersComponent, data: { title: 'Users' } },
            { path: 'roles-and-permissions', title: 'Roles & Permissions | Doqfy', component: RolesAndPermissionsComponent, data: { title: 'Roles & Permissions' } },
            { path: 'documentations', title: 'Documentations | Doqfy', component: DocumentationsComponent, data: { title: 'Documentations' } },
            { path: 'payments-and-invoice', title: 'Payments & Invoice | Doqfy', component: PaymentsAndInvoiceComponent, data: { title: 'Payments & Invoice' } },
            { path: 'pay-my-dues', title: 'Pay my Dues | Payments & Invoice | Doqfy', component: PayMyDuesComponent, data: { title: 'Payments & Invoice /Pay my Dues' } },
            { path: 'raise-complaint', title: 'Raise Complaint | Doqfy', component: RaiseComplaintComponent, data: { title: 'Raise Complaint' } },
            { path: 'privacy-policy', title: 'Privacy Policy | Doqfy', component: PrivacyPolicyComponent, data: { title: 'Privacy Policy' } },
        ]
    },
];

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class DashboardModule { }
