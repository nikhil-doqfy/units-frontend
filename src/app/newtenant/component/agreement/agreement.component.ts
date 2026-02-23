import { Component } from '@angular/core';
import { CustomSelectComponent } from '../../../dashboard/component/custom-select/custom-select.component';
import { AcceptIconComponent } from '../../../dashboard/component/icons/accept-icon/accept-icon.component';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';

@Component({
  selector: 'app-agreement',
  standalone: true,
  imports: [CustomSelectComponent, AcceptIconComponent, WhiteCardComponent],
  templateUrl: './agreement.component.html',
  styleUrl: './agreement.component.css',
})
export class AgreementComponent {}
