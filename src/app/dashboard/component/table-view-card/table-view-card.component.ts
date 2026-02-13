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
import { TranslateModule } from '@ngx-translate/core';
import { DownloadIconComponent } from '../../../icons/download-icon/download-icon.component';
import { ShareIconComponent } from '../icons/share-icon/share-icon.component';

@Component({
  selector: 'app-table-view-card',
  standalone: true,
  imports: [
    CommonModule,
    BackIconComponent,
    EditIconComponent,
    TranslateModule,
    DownloadIconComponent,
    ShareIconComponent,
  ],
  templateUrl: './table-view-card.component.html',
  styleUrls: ['./table-view-card.component.css'],
})
export class TableViewCardComponent {
  @Input() showBack: boolean = true;
  @Input() showImage: boolean = true;
  @Input() title!: string;
  @Input() imgSrc?: string;
  @Input() headerItems: { label: string; value: string }[] = [];
  @Input() items: { label: string; value: string; link?: string }[] = [];
  @Input() showEdit: boolean = false;
  @Input() showDownload: boolean = false;
  @Input() showShare: boolean = false;

  @Output() download = new EventEmitter<string>();
  @Output() share = new EventEmitter<string>();
  @Output() edit = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
  @ContentChildren(TableActionButtonComponent)
  projectedButtons!: QueryList<TableActionButtonComponent>;
  hasProjectedContent = false;
  @ContentChild('[rental]', { static: false }) rentalContent!: any;

  @ContentChild('extraSection', { read: ElementRef })
  extraSection!: ElementRef;

  hasExtraSection = false;

  ngAfterContentInit() {
    this.hasProjectedContent = this.projectedButtons.length > 0;
    return !!this.rentalContent;
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
