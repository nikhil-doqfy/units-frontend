import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { CustomSelectService } from './custom-select.service';
import { ArrowDownIconComponent } from '../../../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
import { ArrowUpIconComponent } from '../../../shared/component/icons/arrow-up-icon/arrow-up-icon.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule, ArrowDownIconComponent, ArrowUpIconComponent],
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.css'],
})
export class CustomSelectComponent implements OnInit {
  @Input() isFilter: boolean = false;
  @Input() isSmall: boolean = false;
  @Input() options: string[] = [];
  @Input() placeholder: string = '--select--';
  @Output() optionSelected = new EventEmitter<string>();

  @Input() selectedOption: string | null = null;
  isDropdownOpen = false;
  private destroyRef = inject(DestroyRef);

  constructor(private dropdownService: CustomSelectService) {}

  ngOnInit() {
    this.dropdownService.openDropdown$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((openComponent) => {
        if (openComponent !== this) {
          this.isDropdownOpen = false;
        }
      });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.dropdownService.notifyOpen(this);
    }
  }

  selectOption(option: string) {
    this.selectedOption = option;
    this.optionSelected.emit(option);
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    if (!(event.target as HTMLElement).closest('.customSelect')) {
      this.isDropdownOpen = false;
    }
  }
}
