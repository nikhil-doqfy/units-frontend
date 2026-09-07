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
  // Finance's sidebar link points at a redirecting parent route
  // (`/dashboard/finance` -> `financeLandingGuard` -> `/dashboard/finance/:pmcId/overview`),
  // so `exact: true` (every other item's own leaf route) never matches and
  // the item never highlights. Pass `exact="false"` for any link like this.
  @Input() exact = true;

  openSidebarValue = true;
  tooltipPlacement: 'start' | 'end' = 'end';
  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    this.sharedService.openSidebarValue$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.openSidebarValue = value;
      });
    this.setTooltipDirection();
  }
  private setTooltipDirection() {
    const dir = document.documentElement.getAttribute('dir');
    this.tooltipPlacement = dir === 'rtl' ? 'start' : 'end';
  }
}
