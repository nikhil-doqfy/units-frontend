import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchIconComponent } from '../../../shared/component/icons/search-icon/search-icon.component';

@Component({
  selector: 'app-table-search',
  standalone: true,
  imports: [CommonModule, SearchIconComponent],
  templateUrl: './table-search.component.html',
  styleUrl: './table-search.component.css',
})
export class TableSearchComponent {
  @Input() placeholder: string = 'Search here...';
  @Output() onValueChange = new EventEmitter<string>();

  isSearchExpanded = false;
  @ViewChild('searchContainer')
  searchContainer!: ElementRef;

  expandSearch(): void {
    this.isSearchExpanded = true;
  }

  collapseSearch(): void {
    this.isSearchExpanded = false;
  }

  onInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.onValueChange.emit(target.value);
  }
}
