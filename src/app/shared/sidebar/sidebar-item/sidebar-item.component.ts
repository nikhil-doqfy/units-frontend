import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SharedService } from '../../../shared.service';

import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-sidebar-item',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgbTooltipModule],
  templateUrl: './sidebar-item.component.html',
  styleUrl: './sidebar-item.component.css'
})
export class SidebarItemComponent {
  @Input() title: string | undefined;
  @Input() href: string | undefined;
  @Input() currentRoute: string = '';

  openSidebarValue = true;
  constructor(private sharedService: SharedService) { }
  ngOnInit() {
    this.sharedService.openSidebarValue$.subscribe(value => {
      this.openSidebarValue = value;
    });
  }
}