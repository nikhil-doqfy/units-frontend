import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Output,
  ViewChild,
} from '@angular/core';
import { SearchIconComponent } from '../component/icons/search-icon/search-icon.component';
import { CircularCrossBtnIconComponent } from '../../icons/circular-cross-btn-icon/circular-cross-btn-icon.component';
import { PhoneIconComponent } from '../../icons/phone-icon/phone-icon.component';
import { SearchMailIconComponent } from '../../icons/search-mail-icon/search-mail-icon.component';
import { SearchWhatsappIconComponent } from '../../icons/search-whatsapp-icon/search-whatsapp-icon.component';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ContactSearchService } from '../../contact-search.service';

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
    ReactiveFormsModule,
  ],
  templateUrl: './search-contact.component.html',
  styleUrl: './search-contact.component.css',
})
export class SearchContactComponent {
  private contactSearchService = inject(ContactSearchService);

  @ViewChild('searchInput') searchInput!: ElementRef;
  @Output() close = new EventEmitter<void>();

  isFocused = false;
  searchControl = new FormControl('');
  contacts: any[] = [];

  ngOnInit(): void {
    this.contactSearchService.getUsers({}).subscribe({
      next: (res) => (this.contacts = res || []),
      error: (err) => console.error('Initial fetch error', err),
    });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter((term): term is string => !!term),
        switchMap((term) =>
          this.contactSearchService.searchUsers({ search: term }),
        ),
      )
      .subscribe((res) => (this.contacts = res || []));
  }

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
