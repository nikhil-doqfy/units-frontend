import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import { SearchIconComponent } from '../component/icons/search-icon/search-icon.component';

@Component({
  selector: 'app-search-contact',
  standalone: true,
  imports: [CommonModule, SearchIconComponent],
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
    },
    {
      name: 'Budi Santoso',
      role: 'Team',
      phone: '+62-12XXX678',
      email: 'budi.sanXXX@mail.com',
    },
    {
      name: 'Siti Aisyah',
      role: 'Tenant',
      phone: '+62-98XXX432',
      email: 'siti.aisXXX@mail.com',
    },
    {
      name: 'Andi Wijaya',
      role: 'Team',
      phone: '+62-11XXX34',
      email: 'andi.wijXXX@mail.com',
    },
    {
      name: 'Dewi Lestari',
      role: 'Landlord',
      phone: '+62-44XXX667',
      email: 'dewi.lesXXX@mail.com',
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
