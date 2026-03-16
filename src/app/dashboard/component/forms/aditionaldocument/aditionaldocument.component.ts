import { Component } from '@angular/core';
import { ArrowDownIconComponent } from '../../../../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-aditionaldocument',
  standalone: true,
  imports: [ArrowDownIconComponent, TranslateModule],
  templateUrl: './aditionaldocument.component.html',
  styleUrl: './aditionaldocument.component.css',
})
export class AditionaldocumentComponent {}
