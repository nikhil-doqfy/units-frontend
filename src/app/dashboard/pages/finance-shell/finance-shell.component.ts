import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SharedService } from '../../../shared.service';
import { StorageService } from '../../../shared/services/storage.service';

interface FinanceNavItem {
  label: string;
  route: string;
  icon: string;
  children?: { label: string; route: string }[];
  pmcOnly?: boolean;
}

@Component({
  selector: 'app-finance-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './finance-shell.component.html',
  styleUrl: './finance-shell.component.css',
})
export class FinanceShellComponent implements OnInit {
  private router = inject(Router);
  private sharedService = inject(SharedService);
  private storage = inject(StorageService);

  activeRoute = '';
  expandedGroup = '';

  navItems: FinanceNavItem[] = [
    {
      label: 'Overview',
      route: '/dashboard/finance/overview',
      icon: 'overview',
    },
    {
      label: 'Reports',
      route: '',
      icon: 'reports',
      children: [
        {
          label: 'Trial Balance',
          route: '/dashboard/finance/reports/trial-balance',
        },
        {
          label: 'Profit & Loss',
          route: '/dashboard/finance/reports/profit-loss',
        },
        {
          label: 'Balance Sheet',
          route: '/dashboard/finance/reports/balance-sheet',
        },
        {
          label: 'Ageing / Collections',
          route: '/dashboard/finance/reports/ageing',
        },
      ],
    },
    {
      label: 'Accounts Receivable',
      route: '',
      icon: 'ar',
      children: [
        {
          label: 'Outstanding by Tenant',
          route: '/dashboard/finance/ar/by-tenant',
        },
        {
          label: 'Outstanding by Unit',
          route: '/dashboard/finance/ar/by-unit',
        },
      ],
    },
    {
      label: 'Bank Reconciliation',
      route: '',
      icon: 'bank',
      pmcOnly: true,
      children: [
        {
          label: 'Import Statement',
          route: '/dashboard/finance/bank-recon/import',
        },
        {
          label: 'Match & Reconcile',
          route: '/dashboard/finance/bank-recon/match',
        },
      ],
    },
  ];

  get visibleNavItems(): FinanceNavItem[] {
    const role = this.storage.getUserRole();
    const isPmc = role === 'property-manager';
    return this.navItems.filter((item) => !item.pmcOnly || isPmc);
  }

  ngOnInit(): void {
    this.syncActive(this.router.url);
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => this.syncActive(e.urlAfterRedirects));
  }

  private syncActive(url: string): void {
    this.activeRoute = url;
    for (const item of this.navItems) {
      if (item.children?.some((c) => url.startsWith(c.route))) {
        this.expandedGroup = item.label;
        return;
      }
    }
  }

  navigate(route: string): void {
    if (route) this.router.navigateByUrl(route);
  }

  toggleGroup(label: string): void {
    this.expandedGroup = this.expandedGroup === label ? '' : label;
  }

  isActive(route: string): boolean {
    return this.activeRoute.startsWith(route) && route !== '';
  }

  isGroupActive(item: FinanceNavItem): boolean {
    if (item.route && this.isActive(item.route)) return true;
    return item.children?.some((c) => this.isActive(c.route)) ?? false;
  }
}
