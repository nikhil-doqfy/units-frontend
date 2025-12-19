import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChildren,
  QueryList,
  ElementRef,
  ContentChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { BackIconComponent } from '../icons/back-icon/back-icon.component';
import { EditIconComponent } from '../../../user/component/icons/edit-icon/edit-icon.component';
import { TableActionButtonComponent } from '../table-action-btn/table-action-btn.component';

@Component({
  selector: 'app-table-view-card',
  standalone: true,
  imports: [CommonModule, BackIconComponent, EditIconComponent],
  templateUrl: './table-view-card.component.html',
  styleUrls: ['./table-view-card.component.css'],
})
export class TableViewCardComponent {
  @Input() title!: string;
  @Input() imgSrc?: string;
  @Input() headerItems: { label: string; value: string }[] = [];
  @Input() items: { label: string; value: string; link?: string }[] = [];
  @Input() showEdit: boolean = false;

  @Output() edit = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
  @ContentChildren(TableActionButtonComponent)
  projectedButtons!: QueryList<TableActionButtonComponent>;
  hasProjectedContent = false;
  @ContentChild('extraSection', { read: ElementRef })
  extraSection!: ElementRef;

  hasExtraSection = false;
  ngAfterContentInit() {
    this.hasProjectedContent = this.projectedButtons.length > 0;
    this.hasExtraSection = !!this.extraSection;
  }

  get titleInitial(): string {
    return this.title ? this.title.charAt(0).toUpperCase() : '';
  }

  onEditClick() {
    this.edit.emit();
  }

  onBackClick() {
    this.back.emit();
  }
  showMenu = false;

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  onRenew() {
    this.showMenu = false;
    console.log('Renew Rental clicked');
  }

  onTerminate() {
    this.showMenu = false;
    console.log('Terminate Rental clicked');
  }
}
