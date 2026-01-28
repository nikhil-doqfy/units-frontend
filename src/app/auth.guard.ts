import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from './shared/services/storage.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const storageService = inject(StorageService);
  const role = storageService.getUserRole();
  if (role === 'property-manager' || role === 'owner') {
    return true;
  }

  if (role === 'tenant') {
    router.navigate(['/dashboard/properties']);
  }
  return false;
};
