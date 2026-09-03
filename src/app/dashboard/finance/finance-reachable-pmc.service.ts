import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PmcService } from '../services/pmc.service';

/**
 * Single source of the Finance-reachable PMC list.
 *
 * Wraps `PmcService.getPMC()` (server-side scoped already, per inherited
 * AD-18 — Finance never re-derives or trusts a client-side allowlist),
 * maps the envelope's `content[].company_id` to a `string[]`, and resolves
 * to `[]` on any HTTP error instead of letting it propagate into the
 * router's guard/resolve pipeline.
 *
 * Callers (finance-landing.guard, finance-pmc-reachable.guard,
 * finance-activation.resolver) must each call `getReachablePmcIds()` at
 * most once per navigation and share the result (e.g. via a `resolve`
 * entry composed with the other checks) so a single navigation never
 * issues more than one `GET /owner/pmc` call.
 */
@Injectable({
  providedIn: 'root',
})
export class FinanceReachablePmcService {
  private pmcService = inject(PmcService);

  getReachablePmcIds(): Observable<string[]> {
    return this.pmcService.getPMC({ limit: 1000, page: 1 }).pipe(
      map((resp: any) =>
        (resp?.content ?? [])
          .map((item: any) =>
            item?.company_id != null ? String(item.company_id) : null,
          )
          .filter((id: string | null): id is string => id !== null),
      ),
      catchError(() => of([] as string[])),
    );
  }
}
