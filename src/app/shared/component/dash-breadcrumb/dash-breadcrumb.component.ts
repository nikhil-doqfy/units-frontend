import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HomeIconComponent } from '../../../dashboard/component/icons/home-icon/home-icon.component';

@Component({
  selector: 'app-dash-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink, HomeIconComponent],
  templateUrl: './dash-breadcrumb.component.html',
  styleUrl: './dash-breadcrumb.component.css',
})
export class DashBreadcrumbComponent {
  @Input() breadcrumbItems: { label: string; link?: string }[] = [];
}
