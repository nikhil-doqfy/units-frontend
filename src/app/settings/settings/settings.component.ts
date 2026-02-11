import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashOuterComponent } from '../../shared/component/dash-outer/dash-outer.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { DashBodyComponent } from '../../shared/component/dash-body/dash-body.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ChargesIconComponent } from '../../icons/charges-icon/charges-icon.component';
import { TermsconditionIconComponent } from '../../icons/termscondition-icon/termscondition-icon.component';
import { UserIconComponent } from '../../auth/component/icons/user-icon/user-icon.component';
import { ProfileIconComponent } from '../../icons/profile-icon/profile-icon.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    RouterOutlet,
    DashOuterComponent,
    HeaderComponent,
    SidebarComponent,
    DashBodyComponent,
    FooterComponent,
    ChargesIconComponent,
    TermsconditionIconComponent,
    UserIconComponent,
    ProfileIconComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {}
