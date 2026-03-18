import { Component } from '@angular/core';
import { ArrowDownIconComponent } from '../../../../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
import { ScannericonComponent } from '../../../../icon/scannericon/scannericon.component';

@Component({
  selector: 'app-replace-cheque',
  standalone: true,
  imports: [ArrowDownIconComponent, ScannericonComponent],
  templateUrl: './replace-cheque.component.html',
  styleUrl: './replace-cheque.component.css',
})
export class ReplaceChequeComponent {}
