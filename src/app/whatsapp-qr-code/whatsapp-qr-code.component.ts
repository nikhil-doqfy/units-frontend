import { Component } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'app-whatsapp-qr-code',
  standalone: true,
  imports: [QRCodeModule],
  templateUrl: './whatsapp-qr-code.component.html',
  styleUrl: './whatsapp-qr-code.component.css',
})
export class WhatsappQrCodeComponent {
  phoneNumber = '919876543210';
  message = 'Hello I want to contact you';
  whatsappLink = `https://wa.me/${this.phoneNumber}?text=${encodeURIComponent(this.message)}`;
}
