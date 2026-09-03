import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { DateIconComponent } from '../../../../component/icons/date-icon/date-icon.component';

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

/**
 * `ControlValueAccessor` wrapping two `ngbDatepicker`-driven inputs
 * (from/to) into one `{from, to}` value -- mirrors `custom-select`'s CVA
 * registration pattern and `add-lease`'s `.datePicker`/toggle-button visual
 * pattern. `ngbDatepicker` already has its own built-in CVA; this
 * component's CVA layer exists only to compose the two inputs into one
 * reactive-forms value, not to reimplement date-picking logic.
 */
@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbDatepickerModule,
    DateIconComponent,
  ],
  templateUrl: './date-range-picker.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangePickerComponent),
      multi: true,
    },
  ],
})
export class DateRangePickerComponent implements ControlValueAccessor {
  // Bound to the `ngbDatepicker` inputs -- ngb-bootstrap's native CVA works
  // in `NgbDateStruct`, so these hold that shape internally.
  from: NgbDateStruct | null = null;
  to: NgbDateStruct | null = null;
  isDisabled = false;

  private onChange: (value: DateRange) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: DateRange | null): void {
    this.from = this.toDateStruct(value?.from ?? null);
    this.to = this.toDateStruct(value?.to ?? null);
  }

  registerOnChange(fn: (value: DateRange) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onFromChange(value: NgbDateStruct): void {
    this.from = value;
    this.emitValue();
  }

  onToChange(value: NgbDateStruct): void {
    this.to = value;
    this.emitValue();
  }

  private emitValue(): void {
    this.onChange({
      from: this.toDate(this.from),
      to: this.toDate(this.to),
    });
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
