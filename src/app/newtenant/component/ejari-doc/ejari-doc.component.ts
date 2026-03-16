import { Component, Input } from '@angular/core';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { DownloadIconComponent } from '../../../icons/download-icon/download-icon.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-ejari-doc',
  standalone: true,
  imports: [
    WhiteCardComponent,
    DownloadIconComponent,
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './ejari-doc.component.html',
  styleUrl: './ejari-doc.component.css',
})
export class EjariDocComponent {
  @Input() form!: FormGroup;
}
