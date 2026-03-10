import { Component, Input } from '@angular/core';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { DownloadIconComponent } from '../../../icons/download-icon/download-icon.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ejari-doc',
  standalone: true,
  imports: [
    WhiteCardComponent,
    DownloadIconComponent,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './ejari-doc.component.html',
  styleUrl: './ejari-doc.component.css',
})
export class EjariDocComponent {
  @Input() form!: FormGroup;
}
