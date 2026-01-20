import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [],
  templateUrl: './qr-code.component.html',
  styleUrl: './qr-code.component.css',
})
export class QrCodeComponent {
  @Input() size: number = 228; // default WhatsApp size
  @Input() label: string = 'Scan this QR code to link a device!';

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    /* Dummy QR look (UI purpose) */
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, this.size, this.size);

    ctx.fillStyle = '#000';
    for (let i = 0; i < 30; i++) {
      ctx.fillRect(Math.random() * this.size, Math.random() * this.size, 8, 8);
    }
  }
}
