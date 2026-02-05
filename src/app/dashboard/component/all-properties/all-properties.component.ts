import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { CommonModule } from '@angular/common';
import { UnitsComponent } from '../units/units.component';
import { TenancyledgerComponent } from '../tenancyledger/tenancyledger.component';

@Component({
  selector: 'app-all-properties',
  standalone: true,
  imports: [
    TranslateModule,
    WhiteCardComponent,
    CommonModule,
    UnitsComponent,
    TenancyledgerComponent,
  ],
  templateUrl: './all-properties.component.html',
  styleUrl: './all-properties.component.css',
})
export class AllPropertiesComponent {
  activeLeadTab: string = 'Units';
}
