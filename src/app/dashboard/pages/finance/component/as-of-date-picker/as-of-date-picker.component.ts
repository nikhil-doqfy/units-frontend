import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { DateIconComponent } from '../../../../component/icons/date-icon/date-icon.component';

/**
 * `ControlValueAccessor` wrapping a single `ngbDatepicker`-driven input,
 * matching `custom-select`'s CVA registration pattern and `add-lease`'s
 * `.datePicker`/toggle-button visual pattern. `ngbDatepicker` already has
 * its own built-in CVA (working in `NgbDateStruct`); this component's CVA
 * layer exists to give this control a consistent component boundary and to
 * expose a single `Date` value, per the pinned contract.
 */
@Component({
  selector: 'app-as-of-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbDatepickerModule, DateIconComponent],
  templateUrl: './as-of-date-picker.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AsOfDatePickerComponent),
      multi: true,
    },
  ],
})
export class AsOfDatePickerComponent implements ControlValueAccessor {
  // Bound to the `ngbDatepicker` input -- ng-bootstrap's native CVA works in
  // `NgbDateStruct`, so this holds that shape internally.
  date: NgbDateStruct | null = null;
  isDisabled = false;

  private onChange: (value: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: Date | null): void {
    this.date = this.toDateStruct(value);
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onDateChange(value: NgbDateStruct): void {
    this.date = value;
    this.onChange(this.toDate(value));
    this.onTouched();
  }

  private toDate(value: NgbDateStruct | null): Date | null {
    if (!value) return null;
    return new Date(value.year, value.month - 1, value.day);
  }

  private toDateStruct(value: Date | null): NgbDateStruct | null {
    if (!value) return null;
    return {
      year: value.getFullYear(),
      month: value.getMonth() + 1,
      day: value.getDate(),
    };
  }
}
