import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LeaseApprovalComponent } from './auth/pages/lease-approval/lease-approval.component';
import { LeaseSignatureComponent } from './auth/pages/lease-signature/lease-signature.component';
import { EjariSignatureComponent } from './auth/pages/ejari-signature/ejari-signature.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  {
    path: 'lease-approval',
    title: 'Lease Approval | Units',
    component: LeaseApprovalComponent,
  },
  {
    path: 'lease-sign',
    title: 'Sign Lease Agreement | Units',
    component: LeaseSignatureComponent,
  },
  {
    path: 'ejari-sign',
    title: 'Ejari Signature | Units',
    component: EjariSignatureComponent,
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'dashboard',

    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.module').then((m) => m.UserModule),
  },

  {
    path: 'settings',

    loadChildren: () =>
      import('./settings/settings/settings.module').then(
        (m) => m.SettingsModule,
      ),
  },
  {
    path: '**',
    title: 'Page Not Found | Units',
    component: PageNotFoundComponent,
  },
];
