import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchIconComponent } from '../../../shared/component/icons/search-icon/search-icon.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-table-search',
  standalone: true,
  imports: [CommonModule, SearchIconComponent, CommonModule],
  templateUrl: './table-search.component.html',
  styleUrl: './table-search.component.css',
})
export class TableSearchComponent implements OnChanges {
  @Input() placeholder: string = 'Search here...';
  @Input() clearTrigger: number = 0;
  @Output() onValueChange = new EventEmitter<string>();
  searchText = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clearTrigger'] && !changes['clearTrigger'].firstChange) {
      this.searchText = '';
    }
  }
  onSearch(): void {
    this.onValueChange.emit(this.searchText);
  }
  onClear(): void {
    this.searchText = '';
  }
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
