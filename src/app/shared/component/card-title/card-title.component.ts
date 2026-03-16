import { Component, input, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-card-title',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './card-title.component.html',
  styleUrl: './card-title.component.css',
})
export class CardTitleComponent {
  @Input() title: string | undefined;
  @Input() description: string | undefined;
  @Input() size: string | undefined;
  @Input() center: boolean | undefined;
  @Input() blockCount: any;
  @Input() unitCount!: number;
}
