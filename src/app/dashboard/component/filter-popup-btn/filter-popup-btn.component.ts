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

      const rect = popup.getBoundingClientRect();

      if (rect.left < 0) {
        popup.classList.add('open-right');
      } else {
        popup.classList.remove('open-right');
      }
    });
  }
  @HostListener('window:resize')
  onResize() {
    if (this.isOpen) {
      this.handleFilterOpenClick();
    }
  }
}
