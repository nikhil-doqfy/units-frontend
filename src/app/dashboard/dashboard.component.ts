import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { DashOuterComponent } from '../shared/component/dash-outer/dash-outer.component';
import { DashBodyComponent } from '../shared/component/dash-body/dash-body.component';
import { HeaderComponent } from '../shared/header/header.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DashOuterComponent, DashBodyComponent, HeaderComponent, SidebarComponent, FooterComponent, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent {
  @Input() breadcrumbData: { label: string; link?: string }[] = [];

  currentLang = 'en';

  constructor(private translate: TranslateService) {
    this.currentLang = this.translate.currentLang || 'en';

    // Listen for language change
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
    });
  }

  onRouteActivate(componentInstance: any) {
    if (componentInstance.breadcrumbData) {
      setTimeout(() => {
        this.breadcrumbData = componentInstance.breadcrumbData;
      });
    }
  }
}

