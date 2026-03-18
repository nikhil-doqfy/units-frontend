import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mask',
  standalone: true,
})
export class MaskPipe implements PipeTransform {
  transform(value: string, type: 'mobile' | 'email'): string {
    if (!value) return '';

    if (type === 'mobile') {
      return value.replace(/(\+?\d{2}\d{2})\d{5}(\d{2})/, '$1*****$2');
    }

    if (type === 'email') {
      const [name, domain] = value.split('@');
      return name.substring(0, 5) + '@***' + domain.substring(1);
    }

    return value;
  }
}
