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

import { PrivacyPolicyComponent } from './component/public-pages/privacy-policy/privacy-policy.component';
import { TermsConditionComponent } from './component/public-pages/terms-condition/terms-condition.component';
import { Helpcomponent } from './component/public-pages/help/help.component';

export const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        title: 'Sign In | Units',
        pathMatch: 'full',
      },
      {
        path: 'login',
        title: 'Sign In | Units',
        component: LoginComponent,
        data: { login: true, pageType: 'login' },
      },
      {
        path: 'forgot-password',
        title: 'Forgot Password | Units',
        component: ForgotPasswordComponent,
        data: { login: true },
      },
      {
        path: 'reset-password',
        title: 'Reset Password | Units',
        component: ResetPasswordComponent,
        data: { login: true, pageType: 'login' },
      },

      {
        path: 'new-user',
        title: 'Sign Up | Units',
        component: NewUserComponent,
        data: { newUser: true, pageType: 'new-user' },
      },
      {
        path: 'validation',
        title: 'Form Validation | Units',
        component: FormValidationComponent,
        data: { validation: true },
      },
      {
        path: 'uploadDocument',
        title: 'uploadDocument | Units',
        component: UploadDocumentComponent,
        data: { uploadDocument: true },
      },

      {
        path: 'terms-conditions',
        title: 'Terms & Conditions | Units',
        component: TermsConditionComponent,
        data: {
          layout: 'full-page',
        },
      },

      {
        path: 'privacy-policy',
        title: 'Privacy Policy | Units',
        component: PrivacyPolicyComponent,
        data: {
          layout: 'full-page',
        },
      },

      {
        path: 'help',
        title: 'Need Help | Units',
        component: Helpcomponent,
        data: {
          layout: 'full-page',
        },
      },
    ],
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class AuthModule {}
