import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnInit,
  forwardRef,
  inject,
  DestroyRef,
  OnChanges,
  SimpleChanges,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

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
import { CalenderIconComponent } from '../../../icons/calender-icon/calender-icon.component';

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [
    CommonModule,
    ArrowDownIconComponent,
    ArrowUpIconComponent,
    FormsModule,
    TranslateModule,
    CalenderIconComponent,
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
  @Input() highlight = false;
  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);
  @Input() width: string = '100%';
  @Input() unitText?: string;
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
  @Input() iconType: 'default' | 'custom' = 'default';
  @Output() optionSelected = new EventEmitter<any>();
  @Output() onOptionAdded = new EventEmitter<any>();
  @Input() multiple = false;
  isDropdownOpen = false;

  filterText: string = '';
  displayOptions: any[] = [];
  dropdownStyle: Record<string, string> = {};

  private onChange = (_: any) => {};
  private onTouched = () => {};
  isDisabled = false;
  selectedOptions: any[] = [];
  constructor(
    private dropdownService: CustomSelectService,
    private el: ElementRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && changes['options'].currentValue) {
      this.displayOptions = [...changes['options'].currentValue];
    }
    if ('selectedOption' in changes) {
      this.selectedOption = changes['selectedOption'].currentValue ?? null;
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

  getSelectedLabels(): string {
    return this.selectedOptions.map((item) => item[this.value]).join(', ');
  }
  toggleSelection(option: any) {
    const index = this.selectedOptions.findIndex(
      (x) => x[this.key] === option[this.key],
    );

    if (index > -1) {
      this.selectedOptions.splice(index, 1);
    } else {
      this.selectedOptions.push(option);
    }

    this.selectedOptions = [...this.selectedOptions];

    this.onChange(this.selectedOptions);

    this.optionSelected.emit(this.selectedOptions);

    this.onTouched();
  }
  isSelected(option: any): boolean {
    return this.selectedOptions.some(
      (item) => item[this.key] === option[this.key],
    );
  }
  // toggleDropdown() {
  //   if (this.isDisabled) return;

  //   this.isDropdownOpen = !this.isDropdownOpen;
  //   if (this.isDropdownOpen) {
  //     this.dropdownService.notifyOpen(this);
  //     const rect = this.el.nativeElement.getBoundingClientRect();
  //     const dropdownHeight = 224;
  //     const spaceBelow = window.innerHeight - rect.bottom;
  //     const openUpward =
  //       spaceBelow < dropdownHeight && rect.top > dropdownHeight;

  // this.dropdownStyle = openUpward
  //   ? {
  //       position: 'fixed',
  //       bottom:   `${window.innerHeight - rect.top + 4}px`,
  //       left:     `${rect.left}px`,
  //       width:    `${rect.width}px`,
  //       'z-index': '9999',
  //     }
  //   : {
  //       position: 'fixed',
  //       top:      `${rect.bottom + 4}px`,
  //       left:     `${rect.left}px`,
  //       width:    `${rect.width}px`,
  //       'z-index': '9999',
  //     };
  //     this.dropdownStyle = openUpward
  //       ? {
  //           position: 'absolute',
  //           bottom: 'calc(100% + 4px)',
  //           right: '0',
  //           width: '100%',
  //           'z-index': '9999',
  //         }
  //       : {
  //           position: 'absolute',
  //           top: 'calc(100% + 4px)',
  //           right: '0',
  //           width: '100%',
  //           'z-index': '9999',
  //         };
  //   }
  //   this.onTouched();
  // }
  toggleDropdown() {
    if (this.isDisabled) return;

    this.isDropdownOpen = !this.isDropdownOpen;

    if (this.isDropdownOpen) {
      this.dropdownService.notifyOpen(this);

      const rect = this.el.nativeElement.getBoundingClientRect();

      const dropdownHeight = 224;
      const dropdownWidth = 200;

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;

      const openUpward =
        spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;

      let positionStyle: any = {};

      if (spaceRight >= dropdownWidth) {
        positionStyle = { left: '0' };
      } else if (spaceLeft >= dropdownWidth) {
        positionStyle = { right: '0' };
      } else {
        positionStyle = { left: '0', right: '0' };
      }

      this.dropdownStyle = openUpward
        ? {
            position: 'absolute',
            bottom: 'calc(100% + 4px)',
            ...positionStyle,
            'z-index': '9999',
          }
        : {
            position: 'absolute',
            top: 'calc(100% + 4px)',
            ...positionStyle,
            'z-index': '9999',
          };

      const isRTL = document.dir === 'rtl';

      if (isRTL) {
        delete this.dropdownStyle['left'];
        this.dropdownStyle['right'] = '0';
      }

      requestAnimationFrame(() => {
        const dropdownEl = this.el.nativeElement.querySelector(
          '.customSelectDropdown',
        );
        if (!dropdownEl) return;

        const rect = dropdownEl.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        if (rect.left < 0) {
          this.dropdownStyle['left'] = '8px';
          delete this.dropdownStyle['right'];
        } else if (rect.right > screenWidth) {
          this.dropdownStyle['right'] = '8px';
          delete this.dropdownStyle['left'];
        }
      });
    }
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
    if (this.multiple) {
      this.selectedOptions = Array.isArray(value) ? [...value] : [];
    } else {
      this.selectedOption = value;
    }
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
