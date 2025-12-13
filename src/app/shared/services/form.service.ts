import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  constructor() {}

  message = {
    contact_number: {
      required: 'Contact number is required.',
      pattern: 'Only numbers are allowed.',
      minlength: 'Minimum 6 digits required.',
      maxlength: 'Maximum 15 digits allowed.',
    },
  };
  isInvalid(
    form: FormGroup,
    controlName: string,
    messages?: string | Record<string, any>
  ) {
    const message = messages || this.message;
    const control = form.get(controlName);
    if (!control) return { status: false, msg: '' };

    const hasError = control.invalid && (control.touched || control.dirty);
    if (!hasError) return { status: false, msg: '' };

    const errors = control.errors || {};
    const defaultMessages: Record<string, string> = {
      required: 'This field is required.',
      email: 'Please enter a valid email address.',
      pattern: 'Please enter a valid value.',
      maxlength: 'You have entered too many characters.',
      minlength: 'You need to enter more characters.',
      max: 'The value is too high.',
      min: 'The value is too low.',
    };

    // Handle specific validation messages with contextual info
    if (errors['maxlength']) {
      const { requiredLength, actualLength } = errors['maxlength'];
      return {
        status: true,
        msg: `Maximum length is ${requiredLength} characters (you entered ${actualLength}).`,
      };
    }

    if (errors['minlength']) {
      const { requiredLength, actualLength } = errors['minlength'];
      return {
        status: true,
        msg: `Minimum length is ${requiredLength} characters (you entered ${actualLength}).`,
      };
    }

    if (errors['max']) {
      const { max, actual } = errors['max'];
      return {
        status: true,
        msg: `Value cannot exceed ${max}. You entered ${actual}.`,
      };
    }

    if (errors['min']) {
      const { min, actual } = errors['min'];
      return {
        status: true,
        msg: `Value must be at least ${min}. You entered ${actual}.`,
      };
    }

    // Handle generic validation errors
    for (const key in errors) {
      const msg =
        // user-defined message (string applies to all errors)
        (typeof messages === 'string' && messages) ||
        // user-defined object per control
        (typeof messages === 'object' && messages?.[controlName]?.[key]) ||
        // user-defined direct key-based message
        (typeof messages === 'object' && messages?.[key]) ||
        // default message fallback
        defaultMessages[key] ||
        'Invalid field value.';

      return { status: true, msg };
    }

    return { status: false, msg: '' };
  }
}
