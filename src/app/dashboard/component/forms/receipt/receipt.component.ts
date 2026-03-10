import { Component } from '@angular/core';
import { DownloadIconComponent } from '../../../../icons/download-icon/download-icon.component';
import { ShareIconComponent } from '../../icons/share-icon/share-icon.component';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [DownloadIconComponent, ShareIconComponent],
  templateUrl: './receipt.component.html',
  styleUrl: './receipt.component.css',
})
export class ReceiptComponent {
  downloadReceipt() {
    console.log('Download clicked');
  }

  shareReceipt() {
    console.log('Share clicked');
  }
}
