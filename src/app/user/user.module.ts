import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './user.component';

import { MyProfileComponent } from './my-profile/my-profile.component';

export const routes: Routes = [
    {
        path: '',
        component: UserComponent,
        children: [
            { path: '', redirectTo: 'my-profile', title: 'My Profile | Doqfy', pathMatch: 'full' },
            { path: 'my-profile', title: 'My Profile | Doqfy', component: MyProfileComponent, data: { title: 'My Profile' } },
        ]
    },
];

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class UserModule { }
