import { Component } from '@angular/core';
import { WahstappIcon1Component } from '../../../icons/wahstapp-icon1/wahstapp-icon1.component';
import { WhatsappTextComponent } from '../../../icons/whatsapp-text/whatsapp-text.component';
import { CallOnDesktopComponent } from '../../../icons/call-on-desktop/call-on-desktop.component';
import { WhatsappDownloadIconsComponent } from '../../../icons/whatsapp-download-icons/whatsapp-download-icons.component';
import { WhatsappIcon2Component } from '../../../icons/whatsapp-icon2/whatsapp-icon2.component';
import { ThreeDotsIconsComponent } from '../../../icons/three-dots-icons/three-dots-icons.component';
import { SettingIconComponent } from '../../../icons/setting-icon/setting-icon.component';
import { UnicodeIconComponent } from '../../../icons/unicode-icon/unicode-icon.component';
import { AngleIconComponent } from '../../../icons/angle-icon/angle-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { WhatsappQrCodeComponent } from '../../../whatsapp-qr-code/whatsapp-qr-code.component';

@Component({
  selector: 'app-whatsapp-leads',
  standalone: true,
  imports: [
    WahstappIcon1Component,
    WhatsappTextComponent,
    CallOnDesktopComponent,
    WhatsappDownloadIconsComponent,
    WhatsappIcon2Component,
    ThreeDotsIconsComponent,
    SettingIconComponent,
    UnicodeIconComponent,
    AngleIconComponent,
    TranslateModule,
    WhatsappQrCodeComponent,
  ],
  templateUrl: './whatsapp-leads.component.html',
  styleUrl: './whatsapp-leads.component.css',
})
export class WhatsappLeadsComponent {}
