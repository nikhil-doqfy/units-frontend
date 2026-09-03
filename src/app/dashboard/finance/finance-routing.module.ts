import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FinanceStubComponent } from './finance-stub.component';

const routes: Routes = [{ path: '', component: FinanceStubComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinanceRoutingModule {}
