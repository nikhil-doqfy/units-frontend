import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PasswordIconComponent } from '../icons/password-icon/password-icon.component';
import { PasswordTooltipComponent } from '../password-tooltip/password-tooltip.component';
import { PasswordShowIconComponent } from '../icons/password-show-icon/password-show-icon.component';
import { PasswordHideIconComponent } from '../icons/password-hide-icon/password-hide-icon.component';

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
})
export class PasswordStrengthFieldComponent {
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();

  passwordStrength = 0;
  showPassword = false;

  onInput(value: string): void {
    this.value = value;
    this.valueChange.emit(value);
    this.evaluatePasswordStrength();
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
