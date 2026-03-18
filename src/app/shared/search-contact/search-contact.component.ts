import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import { SearchIconComponent } from '../component/icons/search-icon/search-icon.component';
import { CircularCrossBtnIconComponent } from '../../icons/circular-cross-btn-icon/circular-cross-btn-icon.component';
import { PhoneIconComponent } from '../../icons/phone-icon/phone-icon.component';
import { SearchMailIconComponent } from '../../icons/search-mail-icon/search-mail-icon.component';
import { SearchWhatsappIconComponent } from '../../icons/search-whatsapp-icon/search-whatsapp-icon.component';

@Component({
  selector: 'app-search-contact',
  standalone: true,
  imports: [
    CommonModule,
    SearchIconComponent,
    CircularCrossBtnIconComponent,
    PhoneIconComponent,
    SearchMailIconComponent,
    SearchWhatsappIconComponent,
  ],
  templateUrl: './search-contact.component.html',
  styleUrl: './search-contact.component.css',
})
export class SearchContactComponent {
  @ViewChild('searchInput') searchInput!: ElementRef;
  @Output() close = new EventEmitter<void>();
  isFocused = false;

  contacts = [
    {
      name: 'Alin Amar',
      role: 'Tenant',
      phone: '+62-27XXXX729',
      email: 'ali@jXXXf@mail.com',
      img: 'assets/search-contact-user/user-1.svg',
    },
    {
      name: 'Budi Santoso',
      role: 'Team',
      phone: '+62-12XXX678',
      email: 'budi.sanXXX@mail.com',
      img: 'assets/search-contact-user/user-2.svg',
    },
    {
      name: 'Siti Aisyah',
      role: 'Tenant',
      phone: '+62-98XXX432',
      email: 'siti.aisXXX@mail.com',
      img: 'assets/search-contact-user/user-3.svg',
    },
    {
      name: 'Andi Wijaya',
      role: 'Team',
      phone: '+62-11XXX34',
      email: 'andi.wijXXX@mail.com',
      img: 'assets/search-contact-user/user-4.svg',
    },
    {
      name: 'Dewi Lestari',
      role: 'Landlord',
      phone: '+62-44XXX667',
      email: 'dewi.lesXXX@mail.com',
      img: 'assets/search-contact-user/user-5.svg',
    },
  ];

  onFocus() {
    this.isFocused = true;
  }

  onBlur() {
    setTimeout(() => {
      this.isFocused = false;
    }, 200);
  }
  closeSearch() {
    this.close.emit();
  }
}
