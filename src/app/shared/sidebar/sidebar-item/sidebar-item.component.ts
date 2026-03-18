import { Component, DestroyRef, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SharedService } from '../../../shared.service';

import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sidebar-item',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgbTooltipModule],
  templateUrl: './sidebar-item.component.html',
  styleUrl: './sidebar-item.component.css',
})
export class SidebarItemComponent {
  private destroyRef = inject(DestroyRef);
  @Input() title: string | undefined;
  @Input() href: string | undefined;
  @Input() currentRoute: string = '';
  @Input() count?: number;

  openSidebarValue = true;

  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    this.sharedService.openSidebarValue$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.openSidebarValue = value;
      });
  }
}
