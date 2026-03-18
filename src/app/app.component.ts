import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerComponent } from 'ngx-spinner';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { SharedService } from './shared.service';
import { InvoiceTemplateComponent } from './shared/invoice-template/invoice-template.component';
import { ToastService } from './core/toast.service';
import { CommonModule } from '@angular/common';
import { WhatsappQrCodeComponent } from './whatsapp-qr-code/whatsapp-qr-code.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NgxSpinnerComponent,
    HttpClientModule,
    TranslateModule,
    CommonModule,
    WhatsappQrCodeComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Doqfy';
  private sharedService = inject(SharedService);
  globalMessage: string | null = null;

  constructor(private toastService: ToastService) {
    this.toastService.message$.subscribe((msg) => {
      this.globalMessage = msg;

      setTimeout(() => {
        this.globalMessage = null;
      }, 3000);
    });
  }
}
