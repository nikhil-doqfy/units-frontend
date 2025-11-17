import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dash-title',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './dash-title.component.html',
  styleUrl: './dash-title.component.css',
})
export class DashTitleComponent {
  @Input() title: string | undefined;
}
