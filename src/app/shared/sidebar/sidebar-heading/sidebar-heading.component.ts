import { Component, DestroyRef, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedService } from '../../../shared.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sidebar-heading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-heading.component.html',
  styleUrl: './sidebar-heading.component.css',
})
export class SidebarHeadingComponent {
  private destroyRef = inject(DestroyRef);
  @Input() title: string | undefined;
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
