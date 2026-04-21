import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnInit,
  OnChanges,
  SimpleChanges,
  forwardRef,
  inject,
  DestroyRef,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ArrowDownIconComponent } from '../../../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
import { ArrowUpIconComponent } from '../../../shared/component/icons/arrow-up-icon/arrow-up-icon.component';
import { CustomSelectService } from '../custom-select/custom-select.service';

@Component({
  selector: 'app-custom-multi-select',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ArrowDownIconComponent,
    ArrowUpIconComponent,
  ],
  templateUrl: './custom-multi-select.component.html',
  styleUrls: ['./custom-multi-select.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomMultiSelectComponent),
      multi: true,
    },
  ],
})
export class CustomMultiSelectComponent implements OnInit, OnChanges, ControlValueAccessor {
  private destroyRef = inject(DestroyRef);

  @Input() options: any[] = [];
  @Input() key: string = 'key';
  @Input() value: string = 'value';
  @Input() placeholder: string = 'SELECT_OPTION';
  @Input() selectedOptions: any[] = [];
  @Input() showFilterInput: boolean = true;

  @Output() optionsSelected = new EventEmitter<any[]>();

  isDropdownOpen = false;
  filterText = '';
  displayOptions: any[] = [];
  dropdownStyle: Record<string, string> = {};
  isDisabled = false;

  private onChange = (_: any) => {};
  private onTouched = () => {};

  constructor(
    private dropdownService: CustomSelectService,
    private el: ElementRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']?.currentValue) {
      this.displayOptions = [...changes['options'].currentValue];
    }
    if ('selectedOptions' in changes) {
      this.selectedOptions = changes['selectedOptions'].currentValue ?? [];
    }
  }

  ngOnInit(): void {
    this.dropdownService.openDropdown$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((openComponent) => {
        if (openComponent !== this) {
          this.isDropdownOpen = false;
        }
      });
  }

  get triggerLabel(): string {
    if (!this.selectedOptions?.length) return '';
    if (this.selectedOptions.length === 1) return this.selectedOptions[0][this.value];
    return `${this.selectedOptions.length} selected`;
  }

  isSelected(option: any): boolean {
    return this.selectedOptions.some((o) => o[this.key] === option[this.key]);
  }

  toggleOption(option: any, event: Event): void {
    event.stopPropagation();
    const exists = this.isSelected(option);
    const updated = exists
      ? this.selectedOptions.filter((o) => o[this.key] !== option[this.key])
      : [...this.selectedOptions, option];

    this.selectedOptions = updated;
    this.onChange(updated.map((o) => o[this.key]));
    this.onTouched();
    this.optionsSelected.emit(updated);
  }

  toggleDropdown(): void {
    if (this.isDisabled) return;
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.dropdownService.notifyOpen(this);
      const rect = this.el.nativeElement.getBoundingClientRect();
      const dropdownHeight = 224;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
      this.dropdownStyle = openUpward
        ? { position: 'fixed', bottom: `${window.innerHeight - rect.top + 4}px`, left: `${rect.left}px`, width: `${rect.width}px`, 'z-index': '9999' }
        : { position: 'fixed', top: `${rect.bottom + 4}px`, left: `${rect.left}px`, width: `${rect.width}px`, 'z-index': '9999' };
    }
    this.onTouched();
  }

  onFilterChange(value: string): void {
    this.filterText = value;
    const search = value.toLowerCase();
    this.displayOptions = value.trim()
      ? this.options.filter((o) => String(o[this.value]).toLowerCase().includes(search))
      : [...this.options];
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    if (!(event.target as HTMLElement).closest('.customMultiSelect')) {
      this.isDropdownOpen = false;
    }
  }

  writeValue(value: any[]): void {
    // value is array of keys — map back to full option objects when options are available
    if (Array.isArray(value) && value.length && this.options.length) {
      this.selectedOptions = this.options.filter((o) => value.includes(o[this.key]));
    } else {
      this.selectedOptions = [];
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled = isDisabled; }
}
