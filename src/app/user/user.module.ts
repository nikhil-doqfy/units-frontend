import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './user.component';

import { AuditlogComponent } from './auditlog/auditlog.component';

export const routes: Routes = [
  {
    path: '',
    component: UserComponent,
    children: [
      {
        path: 'auditlog',

        component: AuditlogComponent,
        data: { titleKey: 'PAGE_TITLE.AUDIT_LOG' },
      },
    ],
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class UserModule {}
