import { Component } from '@angular/core';
import { LocationIconComponent } from '../../icons/location-icon/location-icon.component';
import { EmailIconComponent } from '../../auth/component/icons/email-icon/email-icon.component';
import { CallIconsNewComponent } from '../../icons/call-icons-new/call-icons-new.component';

@Component({
  selector: 'app-invoice-template',
  standalone: true,
  imports: [LocationIconComponent, EmailIconComponent, CallIconsNewComponent],
  templateUrl: './invoice-template.component.html',
  styleUrl: './invoice-template.component.css',
})
export class InvoiceTemplateComponent {}
