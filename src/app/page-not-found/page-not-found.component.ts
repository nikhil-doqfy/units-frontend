import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { HomeIconComponent } from '../dashboard/component/icons/home-icon/home-icon.component';
import { ThemeService, UserRole } from '../theme.service';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [RouterLink, HomeIconComponent],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.css'
})
export class PageNotFoundComponent {
  currentRole: UserRole = 'owner';
  constructor(
    private router: Router,
    private themeService: ThemeService
  ) { }

  ngOnInit() {
    this.themeService.currentRole$.subscribe(role => {
      this.currentRole = role;
    });
  }
  goToHome(): void {
    this.router.navigate(['/']);
  }
}
