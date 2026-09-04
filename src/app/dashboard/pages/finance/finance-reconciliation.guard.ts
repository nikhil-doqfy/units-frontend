import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../../../services/permission.service';

/**
 * Story 3.1's PMC-admin-only route guard (AD-13). Composes alongside the
 * base `authGuard`/`permissionGuard` pair already applied to every Finance
 * route at the parent `finance` route in `dashboard.module.ts`. Checks
 * `permissionService.isPropertyManager()` as-is -- no new role enum, type,
 * or service method -- and redirects mirroring `permissionGuard`'s own
 * redirect target/pattern when `false`.
 */
export const financeReconciliationGuard: CanActivateFn = () => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  if (permissionService.isPropertyManager()) return true;

  router.navigate(['/dashboard/home']);
  return false;
};
