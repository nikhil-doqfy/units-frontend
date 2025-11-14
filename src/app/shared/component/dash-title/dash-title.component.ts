import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dash-title',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dash-title.component.html',
  styleUrl: './dash-title.component.css'
})
export class DashTitleComponent {
  @Input() title: string | undefined;
}
