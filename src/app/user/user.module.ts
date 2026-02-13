import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './user.component';

import { MyProfileComponent } from '../settings/my-profile/my-profile.component';
import { AuditlogComponent } from './auditlog/auditlog.component';

export const routes: Routes = [
  {
    path: '',
    component: UserComponent,
    children: [
      {
        path: '',
        redirectTo: 'my-profile',
        title: 'My Profile | Doqfy',
        pathMatch: 'full',
      },
      {
        path: 'auditlog',
        title: 'Audit Log | Doqfy',
        component: AuditlogComponent,
        data: { title: 'Audit Log' },
      },
    ],
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class UserModule {}
