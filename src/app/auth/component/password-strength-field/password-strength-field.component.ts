import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PasswordIconComponent } from '../icons/password-icon/password-icon.component';
import { PasswordTooltipComponent } from '../password-tooltip/password-tooltip.component';
import { PasswordShowIconComponent } from '../icons/password-show-icon/password-show-icon.component';
import { PasswordHideIconComponent } from '../icons/password-hide-icon/password-hide-icon.component';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
@Component({
  selector: 'app-password-strength-field',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PasswordIconComponent,
    PasswordTooltipComponent,
    PasswordShowIconComponent,
    PasswordHideIconComponent,
  ],
  templateUrl: './password-strength-field.component.html',
  styleUrl: './password-strength-field.component.css',

  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordStrengthFieldComponent),
      multi: true,
    },
  ],
})
export class PasswordStrengthFieldComponent {
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();
  @Input() placeholder: string = 'Enter your password';

  passwordStrength = 0;
  showPassword = false;

  onChange = (value: string) => {};
  onTouched = () => {};
  writeValue(value: string): void {
    this.value = value;
    this.evaluatePasswordStrength();
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  onInput(value: string): void {
    this.value = value;
    this.valueChange.emit(value);
    this.evaluatePasswordStrength();

    this.onChange(value);
    this.onTouched();
  }

  toggleVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  evaluatePasswordStrength(): void {
    const val = this.value || '';
    let strength = 0;

    if (val.length >= 8) strength++;
    if (/\d/.test(val)) strength++;
    if (/[a-z]/.test(val)) strength++;
    if (/[A-Z]/.test(val)) strength++;

    this.passwordStrength = strength;
  }

  getStrengthClass(index: number): string {
    if (this.passwordStrength === 0) return 'strength-bar';
    if (this.passwordStrength === 1)
      return index === 0 ? 'strength-bar red' : 'strength-bar';
    if (this.passwordStrength === 2)
      return index < 2 ? 'strength-bar yellow' : 'strength-bar';
    if (this.passwordStrength === 3)
      return index < 3 ? 'strength-bar yellow' : 'strength-bar';
    if (this.passwordStrength >= 4) return 'strength-bar green';
    return 'strength-bar';
  }
}
