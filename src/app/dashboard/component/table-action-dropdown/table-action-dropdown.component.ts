import {
  Component,
  EventEmitter,
  Input,
  Output,
  Type,
} from '@angular/core';
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
  @Input() dropdownItems: {
    label: string;
    icon: Type<any>;
    action: string;
    type?: string;
  }[] = [];
  @Output() actionClicked = new EventEmitter<string>();
  @Output() dropdownToggled = new EventEmitter<boolean>();

  onActionClick(action: string): void {
    this.actionClicked.emit(action);
  }

  onOpenChange(isOpen: boolean): void {
    this.dropdownToggled.emit(isOpen);
  }
}
