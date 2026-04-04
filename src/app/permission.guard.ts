import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from './services/permission.service';

export const permissionGuard: CanActivateFn = (route) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  const module: string | undefined = route.data?.['module'];

  // No module tagged on route — allow through
  if (!module) return true;

  if (permissionService.canAccessModule(module)) return true;

  router.navigate(['/dashboard/home']);
  return false;
};
