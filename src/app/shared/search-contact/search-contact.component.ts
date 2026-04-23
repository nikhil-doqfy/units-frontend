import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
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
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ContactSearchService } from '../../contact-search.service';
import { TranslateModule } from '@ngx-translate/core';
import { SharedService } from '../../shared.service';

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
    TranslateModule,
  ],
  templateUrl: './search-contact.component.html',
  styleUrl: './search-contact.component.css',
})
export class SearchContactComponent implements AfterViewInit {
  private contactSearchService = inject(ContactSearchService);
  private sharedService = inject(SharedService);
  @ViewChild('searchInput') searchInput!: ElementRef;
  @Output() close = new EventEmitter<void>();

  isFocused    = false;
  activeFilter: 'All' | 'Tenant' | 'Team' | 'Landlord' = 'All';
  searchControl = new FormControl('');
  contacts: any[] = [];

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.searchInput?.nativeElement?.focus();
      this.isFocused = true;
    }, 50);
  }

  ngOnInit(): void {
    this.fetchContacts();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((term) => this.contactSearchService.searchUsers(this.buildParams(term ?? ''))),
      )
      .subscribe((res) => (this.contacts = res?.content || []));

    this.sharedService.initLanguage();
  }

  private buildParams(search = ''): Record<string, any> {
    const p: Record<string, any> = {};
    if (search)                        p['search'] = search;
    if (this.activeFilter !== 'All')   p['role']   = this.activeFilter;
    return p;
  }

  fetchContacts(): void {
    this.contactSearchService
      .getUsers(this.buildParams(this.searchControl.value ?? ''))
      .subscribe({ next: (res) => (this.contacts = res?.content || []) });
  }

  setFilter(f: 'All' | 'Tenant' | 'Team' | 'Landlord'): void {
    this.activeFilter = f;
    this.fetchContacts();
  }

  onFocus(): void  { this.isFocused = true; }

  onBlur(): void {
    setTimeout(() => { this.isFocused = false; }, 200);
  }

  closeSearch(): void { this.close.emit(); }
}
