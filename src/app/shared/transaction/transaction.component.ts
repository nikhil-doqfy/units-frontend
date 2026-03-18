import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css',
})
export class TransactionComponent {
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
}
