import { Component, Input, Output, EventEmitter, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { DotsIconComponent } from "../../component/icons/dots-icon/dots-icon.component";

@Component({
  selector: 'app-dash-dropdown',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule, DotsIconComponent],
  templateUrl: './dash-dropdown.component.html',
  styleUrl: './dash-dropdown.component.css'
})
export class DashDropdownComponent {
  @Input() dropdownItems: { label: string; icon: Type<any>; action: string }[] = [];
  @Output() actionClicked = new EventEmitter<string>();
  @Output() dropdownToggled = new EventEmitter<boolean>();

  onActionClick(action: string) {
    this.actionClicked.emit(action);
  }

  toggleDropdown(isOpen: boolean) {
    this.dropdownToggled.emit(isOpen);
  }
}
