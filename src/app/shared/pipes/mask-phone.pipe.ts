import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskPhone',
  standalone: true
})
export class MaskPhonePipe implements PipeTransform {

  transform(phone: string): string {
    if (!phone || phone.length < 10) return phone;

    const start = phone.substring(0, 2);  
    const end = phone.substring(phone.length - 2);
    return `+91-${start}******${end}`;
  }
}
