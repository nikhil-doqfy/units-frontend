import { ResolveFn } from '@angular/router';
import { Observable, of } from 'rxjs';

export type FinanceActivationState =
  | 'not_activated'
  | 'activated_empty'
  | 'activated';

/**
 * TODO(Spine AD-6): replace with a real call to the units-finance
 * activation endpoint once it exists. units-finance has no such endpoint
 * today, so this is an inline mock colocated with the resolver — Epic 2
 * (AD-8) owns the real Finance HTTP service shape, not this story.
 *
 * Explicitly rejects a non-positive/non-numeric `pmcId` rather than
 * silently falling through to a default `'activated'` state.
 */
function mockFetchFinanceActivation(
  pmcId: string | null,
): Observable<FinanceActivationState> {
  const numericPmcId = Number(pmcId);
  if (!pmcId || !Number.isInteger(numericPmcId) || numericPmcId <= 0) {
    return of('not_activated');
  }

  // Deterministic mock keyed off the pmcId so manual verification is
  // reproducible: even ids => activated, odd ids => activated_empty.
  const state: FinanceActivationState =
    numericPmcId % 2 === 0 ? 'activated' : 'activated_empty';
  return of(state);
}

export const financeActivationResolver: ResolveFn<FinanceActivationState> = (
  route,
) => {
  const pmcId = route.paramMap.get('pmcId');
  return mockFetchFinanceActivation(pmcId);
};
