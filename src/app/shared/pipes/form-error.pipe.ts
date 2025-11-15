import { Pipe, PipeTransform } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Pipe({
  name: 'formError',
  standalone: true,
})
export class FormErrorPipe implements PipeTransform {
  transform(
    form: FormGroup,
    controlName: string,
    messages?: Record<string, any> | string
  ): string {
    const control = form.get(controlName);
    if (!control) return '';
    console.log('control:--->', control);

    // show only when invalid and user interacted (or you forced touched via markAllAsTouched)
    if (control.valid) return '';
    console.log('control2:--->', control);
    if (!control.touched && !control.dirty) return '';
    console.log('control3:--->', control);

    const errors = control.errors || {};

    const defaultMessages: Record<string, string> = {
      required: 'This field is required.',
      pattern: 'Invalid format.',
      email: 'Please enter a valid email address.',
      maxlength: 'Too many characters.',
      minlength: 'Too few characters.',
      max: 'Value is too high.',
      min: 'Value is too low.',
    };

    for (const key in errors) {
      let msg = '';

      if (typeof messages === 'string') {
        msg = messages;
      } else if (typeof messages === 'object') {
        msg =
          messages?.[controlName]?.[key] ||
          messages?.[key] ||
          defaultMessages[key] ||
          'Invalid input.';
      } else {
        msg = defaultMessages[key] || 'Invalid input.';
      }

      const error = errors[key];
      if (error?.requiredLength)
        msg = msg.replace('{requiredLength}', `${error.requiredLength}`);
      if (error?.actualLength)
        msg = msg.replace('{actualLength}', `${error.actualLength}`);
      if (error?.max) msg = msg.replace('{max}', `${error.max}`);
      if (error?.min) msg = msg.replace('{min}', `${error.min}`);

      return msg;
    }

    return '';
  }
}
