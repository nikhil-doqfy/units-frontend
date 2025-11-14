import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedService } from '../../../shared.service';

@Component({
  selector: 'app-sidebar-heading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-heading.component.html',
  styleUrl: './sidebar-heading.component.css'
})
export class SidebarHeadingComponent {
  @Input() title: string | undefined;
  openSidebarValue = true;
  constructor(private sharedService: SharedService) { }
  ngOnInit() {
    this.sharedService.openSidebarValue$.subscribe(value => {
      this.openSidebarValue = value;
    });
  }
}