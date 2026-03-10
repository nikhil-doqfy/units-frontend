import { Component, Input } from '@angular/core';
import { SharePlatfromIconComponent } from '../../icons/share-platfrom-icon/share-platfrom-icon.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-property-share-platfrom',
  standalone: true,
  imports: [SharePlatfromIconComponent, CommonModule],
  templateUrl: './property-share-platfrom.component.html',
  styleUrl: './property-share-platfrom.component.css',
})
export class PropertySharePlatfromComponent {
  @Input() type: 'icons' | 'list' = 'icons';
  showSharePopup = false;
  toggleShare() {
    this.showSharePopup = !this.showSharePopup;
  }
}
