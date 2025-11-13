import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AuthComponent } from './auth.component';

import { LoginComponent } from './pages/login/login.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { NewUserComponent } from './pages/new-user/new-user.component';
import { FormValidationComponent } from './pages/form-validation/form-validation.component';
import { UploadDocumentComponent } from './pages/upload-document/upload-document.component';

export const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        title: 'Sign In | Doqfy',
        pathMatch: 'full',
      },
      {
        path: 'login',
        title: 'Sign In | Doqfy',
        component: LoginComponent,
        data: { login: true },
      },
      {
        path: 'forgot-password',
        title: 'Forgot Password | Doqfy',
        component: ForgotPasswordComponent,
        data: { login: true },
      },
      {
        path: 'reset-password',
        title: 'Reset Password | Doqfy',
        component: ResetPasswordComponent,
        data: { login: true },
      },

      {
        path: 'new-user',
        title: 'Sign Up | Doqfy',
        component: NewUserComponent,
        data: { newUser: true },
      },
      {
        path: 'validation',
        title: 'Form Validation | Doqfy',
        component: FormValidationComponent,
        data: { validation: true },
      },
      {
        path: 'uploadDocument',
        title: 'uploadDocument | Doqfy',
        component: UploadDocumentComponent,
        data: { uploadDocument: true },
      },
    ],
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class AuthModule {}
