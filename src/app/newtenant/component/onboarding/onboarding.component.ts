import { Component, Input } from '@angular/core';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DocumentTypeItemComponent } from '../../../dashboard/component/document-type-item/document-type-item.component';
import { ArrowDownIconComponent } from '../../../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
import { DownloadIconComponent } from '../../../icons/download-icon/download-icon.component';
import { CustomSelectComponent } from '../../../dashboard/component/custom-select/custom-select.component';
import { TranslateModule } from '@ngx-translate/core';
import { CalenderIconComponent } from '../../../icons/calender-icon/calender-icon.component';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    WhiteCardComponent,
    ReactiveFormsModule,
    DocumentTypeItemComponent,
    ArrowDownIconComponent,
    DownloadIconComponent,
    CustomSelectComponent,
    TranslateModule,
    CalenderIconComponent,
  ],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.css',
})
export class OnboardingComponent {
  @Input() form!: FormGroup;
}
