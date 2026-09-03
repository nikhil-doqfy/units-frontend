import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { FinanceReachablePmcService } from './finance-reachable-pmc.service';

/**
 * Re-validates on every Finance navigation that the active `:pmcId` is
 * still in the caller's reachable-PMC list (AD-4's mid-session
 * revalidation). Implements this as a `CanActivateFn` — not a resolver —
 * since only a guard's `UrlTree`/`false` return is honored by Angular's
 * router; a resolver's return value is opaque route data.
 */
export const financePmcReachableGuard: CanActivateFn = (route) => {
  const reachablePmcService = inject(FinanceReachablePmcService);
  const router = inject(Router);

  const pmcId = route.paramMap.get('pmcId');

  return reachablePmcService.getReachablePmcIds().pipe(
    map((reachableIds) => {
      if (pmcId && reachableIds.includes(pmcId)) {
        return true;
      }
      return router.createUrlTree(['/dashboard/finance']);
    }),
  );
};
