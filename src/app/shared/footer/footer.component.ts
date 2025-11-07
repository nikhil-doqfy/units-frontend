import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedService } from '../../shared.service';
import { ThemeService, UserRole } from '../../theme.service';

import { CopyrightIconComponent } from '../../auth/component/icons/copyright-icon/copyright-icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, CopyrightIconComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  currentRole: UserRole = 'owner';
  openSidebarValue = true;
  constructor(
    private sharedService: SharedService,
    private router: Router,
    private themeService: ThemeService
  ) { }
  ngOnInit() {
    this.sharedService.openSidebarValue$.subscribe(value => {
      this.openSidebarValue = value;
    });

    this.themeService.currentRole$.subscribe(role => {
      this.currentRole = role;
    });
  }
  goToDashboard(): void {
    const role = this.currentRole;

    switch (role) {
      case 'owner':
        this.router.navigate(['dashboard/home']);
        break;

      case 'property-manager':
        this.router.navigate(['dashboard/home']);
        break;

      case 'tenant':
        this.router.navigate(['dashboard/properties']);
        break;

      default:
        this.router.navigate(['dashboard/home']);
    }
  }

}
