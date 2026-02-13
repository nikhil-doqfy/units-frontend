import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MyProfileComponent } from '../my-profile/my-profile.component';
import { TermsconditionsComponent } from '../termsconditions/termsconditions.component';
import { ChargesComponent } from '../charges/charges.component';
import { SettingsComponent } from './settings.component';
import { AuditlogComponent } from '../../user/auditlog/auditlog.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      {
        path: 'profile',

        component: MyProfileComponent,
      },
      { path: 'terms', component: TermsconditionsComponent },
      { path: 'charges', component: ChargesComponent },
      { path: 'auditlog', component: AuditlogComponent },
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
    ],
  },
];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SettingsModule {}
