import { Component } from '@angular/core';
import { SharedService } from '../../../shared.service';

import { MailIconComponent } from "../../../dashboard/component/icons/mail-icon/mail-icon.component";
import { CallIconComponent } from "../../../dashboard/component/icons/call-icon/call-icon.component";

@Component({
  selector: 'app-sidebar-support',
  standalone: true,
  imports: [MailIconComponent, CallIconComponent],
  templateUrl: './sidebar-support.component.html',
  styleUrl: './sidebar-support.component.css'
})
export class SidebarSupportComponent {
  openSidebarValue = true;
  constructor(private sharedService: SharedService) { }
  ngOnInit() {
    this.sharedService.openSidebarValue$.subscribe(value => {
      this.openSidebarValue = value;
    });
  }
}