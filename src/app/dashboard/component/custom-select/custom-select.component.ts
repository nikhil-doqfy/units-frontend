import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  forwardRef,
  inject,
  DestroyRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { ArrowDownIconComponent } from '../../../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
import { ArrowUpIconComponent } from '../../../shared/component/icons/arrow-up-icon/arrow-up-icon.component';

import { CustomSelectService } from './custom-select.service';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlertService } from '../../../shared/services/alert.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [
    CommonModule,
    ArrowDownIconComponent,
    ArrowUpIconComponent,
    FormsModule,
    TranslateModule,
  ],
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
export class CustomSelectComponent implements OnInit, ControlValueAccessor {
  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);
  @Input() width: string = '100%';
  @Input() isFilter: boolean = false;
  @Input() isPlain: boolean = false;
  @Input() isSmall: boolean = false;
  @Input() isGrey: boolean = false;
  @Input() options: Record<string, any>[] | any = [];
  @Input() placeholder: string = 'SELECT_OPTION';
  @Input() key: string = 'key';
  @Input() value: string = 'value';
  @Input() selectedOption: any | null = null;
  @Input() showFilterInput: boolean = false;
  @Input() allowAddOption: boolean = false;

  @Output() optionSelected = new EventEmitter<string>();
  @Output() onOptionAdded = new EventEmitter<any>();

  isDropdownOpen = false;
  filterText: string = '';
  displayOptions: any[] = [];

  private onChange = (_: any) => {};
  private onTouched = () => {};
  isDisabled = false;

  constructor(private dropdownService: CustomSelectService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && changes['options'].currentValue) {
      this.displayOptions = [...changes['options'].currentValue];
    }
  }

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
    if (this.isDisabled) return;

    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.dropdownService.notifyOpen(this);
    }
    this.onTouched();
  }

  selectOption(option: any) {
    this.selectedOption = option;
    this.onChange(option);
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

  onInputChange(value: string) {
    this.filterText = value;

    if (!value.trim()) {
      this.displayOptions = [...this.options];
      return;
    }

    if (this.showFilterInput || this.allowAddOption) {
      const search = value.toLowerCase();
      this.displayOptions = this.options.filter((opt: any) =>
        String(opt[this.value]).toLowerCase().includes(search),
      );
    }
  }

  addOption() {
    const text = this.filterText?.trim();
    if (!text) return;

    const exists = this.options.some(
      (opt: any) =>
        String(opt[this.value]).toLowerCase() === text.toLowerCase(),
    );

    if (exists) {
      this.alertService.error('Option already exists');
      return;
    }

    const newOption = {
      [this.key]: text,
      [this.value]: text,
      isNew: true,
    };

    this.options = [...this.options, newOption];
    this.displayOptions = [...this.options];
    this.selectedOption = newOption;

    this.onChange(newOption);
    this.onOptionAdded.emit(this.options);
    this.filterText = '';
  }
}
