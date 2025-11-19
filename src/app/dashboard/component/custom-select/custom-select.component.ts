import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { ArrowDownIconComponent } from '../../../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
import { ArrowUpIconComponent } from '../../../shared/component/icons/arrow-up-icon/arrow-up-icon.component';

import { CustomSelectService } from './custom-select.service'; // 👈 Import the service
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule, ArrowDownIconComponent, ArrowUpIconComponent],
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true,
    },
  ],
})
export class CustomSelectComponent
  implements OnInit, OnDestroy, ControlValueAccessor
{
  @Input() isFilter: boolean = false;
  @Input() isPlain: boolean = false;
  @Input() isSmall: boolean = false;
  @Input() isGrey: boolean = false;
  @Input() options: Record<string, any>[] | any = [];
  @Input() placeholder: string = '--Select--';
  @Input() key: string = 'key';
  @Input() value: string = 'value';
  @Input() selectedOption: any | null = null;

  @Output() optionSelected = new EventEmitter<string>();

  isDropdownOpen = false;

  private subscription!: Subscription;

  // CVA callbacks
  private onChange = (_: any) => {};
  private onTouched = () => {};
  isDisabled = false;

  constructor(private dropdownService: CustomSelectService) {}

  ngOnInit() {
    this.subscription = this.dropdownService.openDropdown$.subscribe(
      (openComponent) => {
        if (openComponent !== this) {
          this.isDropdownOpen = false; // Close if another component is opened
        }
      }
    );
  }

  toggleDropdown() {
    if (this.isDisabled) return;

    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.dropdownService.notifyOpen(this);
    }
    this.onTouched();
  }

  selectOption(option: any) {
    this.selectedOption = option;
    this.onChange(option); // IMPORTANT: update Angular form
    this.optionSelected.emit(option);
    this.isDropdownOpen = false;
    this.onTouched();
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    if (!(event.target as HTMLElement).closest('.customSelect')) {
      this.isDropdownOpen = false;
    }
  }

  // -----------------------------
  // CONTROL VALUE ACCESSOR METHODS
  // -----------------------------

  writeValue(value: any): void {
    this.selectedOption = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.isDisabled = isDisabled;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
