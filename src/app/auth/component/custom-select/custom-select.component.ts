import { Component, Input, Output, EventEmitter, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { ArrowDownIconComponent } from '../../../shared/component/icons-new/arrow-down-icon/arrow-down-icon.component';
import { ArrowUpIconComponent } from '../../../shared/component/icons-new/arrow-up-icon/arrow-up-icon.component';

import { CustomSelectService } from './custom-select.service'; // 👈 Import the service

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule, ArrowDownIconComponent, ArrowUpIconComponent],
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.css']
})
export class CustomSelectComponent implements OnInit, OnDestroy {
  @Input() isFilter: boolean = false;
  @Input() isSmall: boolean = false;
  @Input() options: string[] = [];
  @Input() placeholder: string = '--select--';
  @Output() optionSelected = new EventEmitter<string>();

  selectedOption: string | null = null;
  isDropdownOpen = false;

  private subscription!: Subscription;

  constructor(private dropdownService: CustomSelectService) { }

  ngOnInit() {
    this.subscription = this.dropdownService.openDropdown$.subscribe(openComponent => {
      if (openComponent !== this) {
        this.isDropdownOpen = false; // Close if another component is opened
      }
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.dropdownService.notifyOpen(this); // Notify service of current open dropdown
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

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
