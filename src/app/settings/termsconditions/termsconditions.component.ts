import { Component } from '@angular/core';
import { WhiteCardComponent } from '../../shared/component/white-card/white-card.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { EditIconComponent } from '../../user/component/icons/edit-icon/edit-icon.component';

@Component({
  selector: 'app-termsconditions',
  standalone: true,
  imports: [
    WhiteCardComponent,
    CommonModule,
    TranslateModule,
    EditIconComponent,
  ],
  templateUrl: './termsconditions.component.html',
  styleUrl: './termsconditions.component.css',
})
export class TermsconditionsComponent {
  currentLanguage = 'en';
  activeTab: string = 'login';
}
