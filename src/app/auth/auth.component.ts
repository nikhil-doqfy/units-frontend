import {
  Component,
  DestroyRef,
  inject,
  Input,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ThemeService, UserRole } from '../theme.service';

import { AuthHeaderComponent } from './component/auth-header/auth-header.component';
import { AuthFormCardComponent } from './component/auth-form-card/auth-form-card.component';
import { AuthPattIconComponent } from './component/icons/auth-patt-icon/auth-patt-icon.component';
import { AuthFooterComponent } from './component/auth-footer/auth-footer.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-auth',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    AuthHeaderComponent,
    AuthFormCardComponent,
    AuthPattIconComponent,
    AuthFooterComponent,
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  @Input() login: boolean | undefined;
  @Input() newUser: boolean | undefined;
  @Input() pageType: string | undefined;

  currentRole: UserRole = 'owner';
  currentRole$ = this.themeService.currentRole$;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.themeService.currentRole$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((role) => {
        this.currentRole = role;
      });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.pageType =
          this.activatedRoute.snapshot.firstChild?.routeConfig?.path || '';
      });
  }
}
