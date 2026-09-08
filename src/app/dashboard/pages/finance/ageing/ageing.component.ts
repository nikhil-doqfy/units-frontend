import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, Subject, catchError, of, switchMap, tap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import {
  ReportColumn,
  ReportTableComponent,
} from '../component/report-table/report-table.component';
import { FinanceEmptyStateComponent } from '../component/finance-empty-state/finance-empty-state.component';
import { FinanceNavComponent } from '../component/finance-nav/finance-nav.component';
import { FinanceReportsService } from '../../../services/finance-reports.service';
import { unwrapFinanceEnvelope } from '../finance-envelope';
import { FinanceActivationState } from '../finance-activation.resolver';
import {
  BreadCrumb,
  PageChange,
  PageSizeChange,
} from '../../../../shared/model/shared.model';
import { SharedService } from '../../../../shared.service';

interface AgeingRow {
  lease_transaction_id: number;
  cheque_date: string;
  days_overdue: number;
  bucket: string;
  outstanding_amount: number;
}

/**
 * Story 3.5: Ageing report page, the last of the four Epic 3 report pages
 * and the only one that paginates. Mirrors Balance Sheet's page structure
 * (reactive `paramMap` subscription, `unwrapFinanceEnvelope`,
 * `FinanceEmptyStateComponent` gating) but has no date control at all --
 * Ageing is always "as of today" per the backend's own contract (spec
 * Design Notes). `report-table`'s `(pageChange)` output is the sole
 * re-fetch trigger, guarded by the `componentName`-matching convention
 * every other paginated list in this app uses (`all-leads.component.ts`).
 *
 * Each row's `bucket` field renders exactly as the API returns it -- never
 * recomputed client-side from `days_overdue` (spec Boundaries &
 * Constraints).
 */
@Component({
  selector: 'app-ageing',
  standalone: true,
  imports: [
    CommonModule,
    ReportTableComponent,
    FinanceEmptyStateComponent,
    FinanceNavComponent,
    TranslateModule,
  ],
  templateUrl: './ageing.component.html',
})
export class AgeingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private financeReportsService = inject(FinanceReportsService);
  private sharedService = inject(SharedService);
  private destroyRef = inject(DestroyRef);

  componentName = 'ageingComponent';

  pmcId = '';
  financeActivation: FinanceActivationState = 'not_activated';
  breadcrumbData: BreadCrumb[] = [];

  columns: ReportColumn[] = [
    { key: 'lease_transaction_id', label: 'FINANCE_COL_LEASE_TRANSACTION' },
    { key: 'cheque_date', label: 'FINANCE_COL_CHEQUE_DATE', type: 'date' },
    { key: 'days_overdue', label: 'FINANCE_COL_DAYS_OVERDUE', align: 'end' },
    { key: 'bucket', label: 'FINANCE_COL_BUCKET' },
    {
      key: 'outstanding_amount',
      label: 'FINANCE_COL_OUTSTANDING_AMOUNT',
      align: 'end',
    },
  ];

  rows: Record<string, string | number>[] = [];

  currentPage = 1;
  totalRecords = 0;
  rowsPerPage = 25;

  loading = false;
  loadFailed = false;

  // Drives every fetch (initial mount and every page change) through one
  // switchMap pipeline so a fast page click -- or a paramMap emission
  // arriving while a request is still in flight -- can never let a stale
  // response overwrite a newer one's result (same fix applied to Trial
  // Balance/P&L/Balance Sheet's date-control pipelines).
  private fetchTrigger = new Subject<void>();

  ngOnInit(): void {
    // Subscribed before `paramMap` below: `fetchTrigger` is a plain Subject
    // (not a BehaviorSubject), so a `.next()` call with no subscriber yet
    // listening is silently dropped. `paramMap` emits synchronously on
    // subscribe (the current route params are already known), and its
    // handler below calls `fetchTrigger.next()` on that very first
    // synchronous emission -- if this pipeline were wired up afterward
    // (as it originally was), that first fetch would be lost and the page
    // would render empty until the user changed the page, which is what
    // finally set up a listener in time.
    this.fetchTrigger
      .pipe(
        switchMap(() => {
          if (this.financeActivation !== 'activated' || !this.pmcId) {
            return EMPTY;
          }
          return this.doFetchAgeing();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    // Read params/data reactively, not from a one-time snapshot: Angular's
    // default RouteReuseStrategy reuses this component instance when only
    // `:pmcId` changes, so a snapshot-only read would keep showing the
    // previous PMC's data (mirrors the other three report pages).
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.pmcId = params.get('pmcId') ?? '';
        this.financeActivation = this.route.snapshot.data[
          'financeActivation'
        ] as FinanceActivationState;
        this.loadBreadcrumb();

        this.rows = [];
        this.currentPage = 1;
        this.totalRecords = 0;
        this.loadFailed = false;

        if (this.financeActivation === 'activated' && this.pmcId) {
          this.fetchTrigger.next();
        }
      });
  }

  // Follows the exact `componentName`-matching guard convention
  // `all-leads.component.ts` uses for its own `onPageChange` (spec Always).
  onPageChange(event: PageChange): void {
    if (event.componentName !== this.componentName) return;
    this.currentPage = event.currentPage;
    this.fetchTrigger.next();
  }

  onPageSizeChange(event: PageSizeChange): void {
    if (event.componentName !== this.componentName) return;
    this.rowsPerPage = event.pageSize;
    this.currentPage = 1;
    this.fetchTrigger.next();
  }

  private loadBreadcrumb(): void {
    this.sharedService
      .getBreadcrumbs([
        { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
        { label: 'PAGE_TITLE.FINANCE', link: `/dashboard/finance/${this.pmcId}/overview` },
        { label: 'FINANCE_AGEING', link: '' },
      ])
      .subscribe((data) => (this.breadcrumbData = data));
  }

  private doFetchAgeing() {
    this.loading = true;
    this.loadFailed = false;

    return this.financeReportsService
      .getAgeing(this.pmcId, this.currentPage, this.rowsPerPage)
      .pipe(
        tap((resp) => {
          this.loading = false;
          const content = unwrapFinanceEnvelope<AgeingRow[]>(resp);
          this.applyContent(content, resp?.pagination);
        }),
        catchError(() => {
          this.loading = false;
          this.loadFailed = true;
          this.rows = [];
          this.totalRecords = 0;
          return of(null);
        }),
      );
  }

  private applyContent(content: AgeingRow[], pagination: any): void {
    const rows = content ?? [];
    this.rows = rows.map((row) => ({
      lease_transaction_id: row.lease_transaction_id,
      cheque_date: row.cheque_date,
      days_overdue: row.days_overdue,
      bucket: row.bucket,
      outstanding_amount: row.outstanding_amount,
    }));

    this.totalRecords = pagination?.total_records ?? this.rows.length;
  }
}
