import { Component, Input, Output, EventEmitter, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { DotsIconComponent } from '../icons/dots-icon/dots-icon.component';

@Component({
  selector: 'app-table-action-dropdown',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule, DotsIconComponent],
  templateUrl: './table-action-dropdown.component.html',
  styleUrl: './table-action-dropdown.component.css',
})
export class TableActionDropdownComponent {
  @Input() menuClass: string = '';
  @Input() dropdownItems: {
    label: string;
    icon: Type<any>;
    action: string;
    type?: string;
  }[] = [];
  @Output() actionClicked = new EventEmitter<string>();
  @Output() dropdownToggled = new EventEmitter<boolean>();

  onActionClick(action: string) {
    this.actionClicked.emit(action);
  }

  toggleDropdown(isOpen: boolean) {
    this.dropdownToggled.emit(isOpen);
  }
}
