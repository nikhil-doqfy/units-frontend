import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type FinanceIconName = 'master' | 'overview' | 'reports' | 'ar' | 'bank';

@Component({
  selector: 'app-finance-icons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finance-icons.component.html',
  styleUrl: './finance-icons.component.css',
})
export class FinanceIconsComponent {
  @Input() icon: string = 'overview';
}
