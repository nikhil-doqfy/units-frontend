import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-platfrom-cell',
  standalone: true,
  imports: [],
  templateUrl: './platfrom-cell.component.html',
  styleUrl: './platfrom-cell.component.css',
})
export class PlatfromCellComponent {
  showPopup = false;

  togglePopup() {
    this.showPopup = !this.showPopup;
  }
}
