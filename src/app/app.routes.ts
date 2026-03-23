import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LeaseApprovalComponent } from './auth/pages/lease-approval/lease-approval.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  {
    path: 'lease-approval',
    title: 'Lease Approval | Doqfy',
    component: LeaseApprovalComponent,
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
    title: 'Page Not Found | Doqfy',
    component: PageNotFoundComponent,
  },
];
