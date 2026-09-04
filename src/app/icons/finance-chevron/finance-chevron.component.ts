import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-finance-chevron',
  standalone: true,
  imports: [],
  templateUrl: './finance-chevron.component.html',
  styleUrl: './finance-chevron.component.css',
})
export class FinanceChevronComponent {
  @Input() isOpen = false;
}
