import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PmcService } from '../../services/pmc.service';

export interface ReachablePmc {
  id: string;
  name: string;
}

/**
 * Single source of the Finance-reachable PMC list.
 *
 * Wraps `PmcService.getPMC()` (server-side scoped already, per inherited
 * AD-18 — Finance never re-derives or trusts a client-side allowlist),
 * maps the envelope's `content[].company_id`/`content[].company_name` to
 * `{ id, name }[]`, and resolves to `[]` on any HTTP error instead of
 * letting it propagate into the router's guard/resolve pipeline.
 *
 * Each consumer (finance-landing.guard, finance-pmc-reachable.guard,
 * finance-overview.component) calls `getReachablePmcs()` independently —
 * on the `:pmcId/overview` route this means the guard and the component
 * each issue one `GET /owner/pmc` call per navigation (2 total, not 1).
 * Angular's `canActivate`/`resolve`/component-construction phases don't
 * share data without a `resolve` entry the component reads from
 * `route.data`, which would need its own guard-vs-resolver restructuring
 * — tracked as a deferred follow-up rather than solved here.
 */
@Injectable({
  providedIn: 'root',
})
export class FinanceReachablePmcService {
  private pmcService = inject(PmcService);

  getReachablePmcs(): Observable<ReachablePmc[]> {
    return this.pmcService.getPMC({ limit: 1000, page: 1 }).pipe(
      map((resp: any) =>
        (resp?.content ?? [])
          .map((item: any) =>
            item?.company_id != null
              ? {
                  id: String(item.company_id),
                  name: item?.company_name != null
                    ? String(item.company_name)
                    : String(item.company_id),
                }
              : null,
          )
          .filter((pmc: ReachablePmc | null): pmc is ReachablePmc => pmc !== null),
      ),
      catchError(() => of([] as ReachablePmc[])),
    );
  }
}
