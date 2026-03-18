import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { DashOuterComponent } from '../shared/component/dash-outer/dash-outer.component';
import { DashBodyComponent } from '../shared/component/dash-body/dash-body.component';
import { HeaderComponent } from '../shared/header/header.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DashOuterComponent, DashBodyComponent, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {

}
