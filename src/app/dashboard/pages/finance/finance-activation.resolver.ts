import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResolveFn } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { unwrapFinanceEnvelope } from './finance-envelope';

export type FinanceActivationState =
  | 'not_activated'
  | 'activated_empty'
  | 'activated';

interface FinancePmcProfileStatusContent {
  pmc_id: string;
  status: FinanceActivationState;
}

/**
 * Spine AD-6 item 2, resolved: `GET finance-pmc-profile/<pmc_id>/status/`
 * now exists. `pmc_id` is a URL path segment here (not a query param,
 * unlike every other Finance endpoint) since this is the one deliberate
 * exception per AD-6's resolution note. Always a 200 for a reachable PMC
 * regardless of activation state; a `catchError` fallback below still
 * covers network failure/401/403/500 so a resolver failure never breaks
 * navigation (Story 1.3's original constraint, unchanged).
 *
 * Explicitly rejects a non-positive/non-numeric `pmcId` rather than
 * silently falling through to a default `'activated'` state.
 */
function fetchFinanceActivation(
  http: HttpClient,
  pmcId: string | null,
): Observable<FinanceActivationState> {
  const numericPmcId = Number(pmcId);
  if (!pmcId || !Number.isInteger(numericPmcId) || numericPmcId <= 0) {
    return of('not_activated');
  }

  return http
    .get(
      `${environment.FINANCE_SERVER_ADDRESS}/finance-pmc-profile/${numericPmcId}/status/`,
    )
    .pipe(
      map(
        (resp) =>
          unwrapFinanceEnvelope<FinancePmcProfileStatusContent>(resp).status,
      ),
      catchError(() => of<FinanceActivationState>('not_activated')),
    );
}

export const financeActivationResolver: ResolveFn<FinanceActivationState> = (
  route,
) => {
  const http = inject(HttpClient);
  const pmcId = route.paramMap.get('pmcId');
  return fetchFinanceActivation(http, pmcId);
};
