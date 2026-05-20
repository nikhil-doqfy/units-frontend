import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { TableFilterButtonComponent } from '../table-filter-btn/table-filter-btn.component';
import { FilterIconComponent } from '../icons/filter-icon/filter-icon.component';
import { DashFormComponent } from '../../../shared/component/dash-form/dash-form.component';
import { CrossIconComponent } from '../icons/cross-icon/cross-icon.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-filter-popup-btn',
  standalone: true,
  imports: [
    CommonModule,
    TableFilterButtonComponent,
    FilterIconComponent,
    DashFormComponent,
    CrossIconComponent,
    TranslateModule,
  ],
  templateUrl: './filter-popup-btn.component.html',
  styleUrl: './filter-popup-btn.component.css',
})
export class FilterPopupButtonComponent {
  isOpen = false;
  @Output() popupClosed = new EventEmitter<void>();
  constructor(private eRef: ElementRef) {}

  // handleFilterOpenClick(): void {
  //   this.isOpen = true;
  // }

  handleFilterCloseClick(): void {
    this.isOpen = false;
    this.popupClosed.emit();
  }

  closePopup(): void {
    this.isOpen = false;
    this.popupClosed.emit();
  }
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (this.isOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  handleFilterOpenClick(): void {
    this.isOpen = true;

    setTimeout(() => {
      const popup = this.eRef.nativeElement.querySelector('.fltrPopup');
      if (!popup) return;

      // reset styles
      popup.style.left = '';
      popup.style.right = '';
      popup.style.transform = '';
      popup.classList.remove('open-right');

      const rect = popup.getBoundingClientRect();
      const screenWidth = window.innerWidth;

      // 👉 If going outside right → shift left
      if (rect.right > screenWidth) {
        const overflow = rect.right - screenWidth;
        popup.style.transform = `translateX(-${overflow + 10}px)`;
      }

      // 👉 If going outside left → shift right
      if (rect.left < 0) {
        const overflow = Math.abs(rect.left);
        popup.style.transform = `translateX(${overflow + 10}px)`;
      }
    });
  }
  @HostListener('window:resize')
  onResize() {
    // 🔥 Do nothing (or just close)
    if (this.isOpen) {
      this.closePopup(); // safest
    }
  }
}
