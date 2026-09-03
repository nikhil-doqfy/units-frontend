import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { StorageService } from '../../shared/services/storage.service';
import { FinanceReachablePmcService } from './finance-reachable-pmc.service';

/**
 * Implements AD-4's no-`:pmcId` landing redirect as a `CanActivateFn` that
 * actually navigates.
 *
 * A prior implementation attempt built this as a `resolve: { redirect: ... }`
 * entry returning a `UrlTree`; Angular's router only special-cases a
 * `UrlTree`/`false` return from `canActivate`/`canMatch`, so that resolver's
 * return value was stored as inert route data and never triggered a
 * redirect — the landing page always rendered its empty state regardless
 * of how many PMCs the user could actually reach. This guard is the fix.
 */
export const financeLandingGuard: CanActivateFn = () => {
  const reachablePmcService = inject(FinanceReachablePmcService);
  const storageService = inject(StorageService);
  const router = inject(Router);

  return reachablePmcService.getReachablePmcIds().pipe(
    map((reachableIds) => {
      if (reachableIds.length === 0) {
        // No reachable PMC at all — let FinanceLandingComponent render
        // the empty state instead of redirecting (no infinite loop).
        return true;
      }

      const lastSelected = storageService.getLastFinancePmcId();
      const targetPmcId =
        lastSelected && reachableIds.includes(lastSelected)
          ? lastSelected
          : reachableIds[0];

      return router.createUrlTree([
        '/dashboard/finance',
        targetPmcId,
        'overview',
      ]);
    }),
  );
};
