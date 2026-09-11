import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError, of, tap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import {
  ReportColumn,
  ReportTableComponent,
} from '../component/report-table/report-table.component';
import { FinanceEmptyStateComponent } from '../component/finance-empty-state/finance-empty-state.component';
import { FinanceNavComponent } from '../component/finance-nav/finance-nav.component';
import { WhiteCardComponent } from '../../../../shared/component/white-card/white-card.component';
import { FinanceLedgerService } from '../../../services/finance-ledger.service';
import { ChargesService } from '../../../../charges.service';
import { unwrapFinanceEnvelope } from '../finance-envelope';
import { FinanceActivationState } from '../finance-activation.resolver';
import { SharedService } from '../../../../shared.service';
import { BreadCrumb } from '../../../../shared/model/shared.model';

interface ChargeCatalogRow {
  id: number;
  description: string;
  amount: number;
}

interface ChartOfAccountsRow {
  id: number;
  name: string;
  account_type: string;
  balance: string;
}

interface ChartOfAccountsContent {
  pmc_id: string;
  accounts: ChartOfAccountsRow[];
}

interface PmcChargeTypeRow {
  id: number;
  charge_id: number;
  account_id: number;
  account_name: string;
  active: boolean;
}

interface PmcChargeTypesContent {
  pmc_id: string;
  charge_types: PmcChargeTypeRow[];
}

/**
 * Story 5.2 (FR-17): PMC Charge Types settings page -- lets a PMC operator
 * map an existing `Charge` catalog row (units-backend's `/settings/charges`,
 * read here via the existing `ChargesService`, never modified) to a Finance
 * `Account`, so a non-bounce `OTHER_CHARGE` LeaseTransaction referencing
 * that charge posts to the Ledger via `post_other_charge` instead of being
 * invisible to accounting.
 *
 * Not a general PMC profile editor (spec Always) -- currency/country/
 * fiscal-year fields stay out of scope, unchanged. Mirrors
 * `ChartOfAccountsComponent`'s reactive `paramMap` pattern and
 * `ManualEntriesComponent`'s list + add/edit-inline-form shape (kept as an
 * inline form here rather than a modal -- this page's form has only three
 * fields, no dynamic line-row list to justify a separate modal component).
 */
@Component({
  selector: 'app-pmc-charge-types',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReportTableComponent,
    FinanceEmptyStateComponent,
    FinanceNavComponent,
    WhiteCardComponent,
    TranslateModule,
  ],
  templateUrl: './pmc-charge-types.component.html',
})
export class PmcChargeTypesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private financeLedgerService = inject(FinanceLedgerService);
  private chargesService = inject(ChargesService);
  private sharedService = inject(SharedService);
  private destroyRef = inject(DestroyRef);

  pmcId = '';
  financeActivation: FinanceActivationState = 'not_activated';
  breadcrumbData: BreadCrumb[] = [];

  columns: ReportColumn[] = [
    { key: 'charge_description', label: 'FINANCE_COL_CHARGE' },
    { key: 'account_name', label: 'FINANCE_COL_ACCOUNT' },
    { key: 'active', label: 'FINANCE_COL_ACTIVE' },
  ];

  rows: Record<string, string | number>[] = [];
  charges: ChargeCatalogRow[] = [];
  accounts: ChartOfAccountsRow[] = [];
  private chargeTypes: PmcChargeTypeRow[] = [];

  loading = false;
  loadFailed = false;
  saving = false;
  saveError: string | null = null;

  showForm = false;
  formChargeId: number | null = null;
  formAccountId: number | null = null;
  formActive = true;

  ngOnInit(): void {
    // Reactive, not snapshot-only: Angular's default RouteReuseStrategy
    // reuses this component instance when only `:pmcId` changes (mirrors
    // Chart of Accounts/Manual Entries, Story 2.2/5.1).
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.pmcId = params.get('pmcId') ?? '';
        this.financeActivation = this.route.snapshot.data[
          'financeActivation'
        ] as FinanceActivationState;
        this.loadBreadcrumb();

        this.rows = [];
        this.charges = [];
        this.accounts = [];
        this.chargeTypes = [];
        this.loadFailed = false;
        this.closeForm();

        if (this.financeActivation === 'activated' && this.pmcId) {
          this.fetchCharges();
          this.fetchAccounts();
          this.fetchChargeTypes();
        }
      });
  }

  private loadBreadcrumb(): void {
    this.sharedService
      .getBreadcrumbs([
        { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
        { label: 'PAGE_TITLE.FINANCE', link: `/dashboard/finance/${this.pmcId}/overview` },
        { label: 'FINANCE_PMC_CHARGE_TYPES', link: '' },
      ])
      .subscribe((data) => (this.breadcrumbData = data));
  }

  private fetchCharges(): void {
    this.chargesService
      .charges({})
      .pipe(
        tap((resp: any) => {
          const data = resp?.content ?? [];
          this.charges = data.map((c: any) => ({
            id: c.id,
            description: c.description,
            amount: c.amount,
          }));
        }),
        catchError(() => {
          this.charges = [];
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private fetchAccounts(): void {
    this.financeLedgerService
      .getChartOfAccounts(this.pmcId)
      .pipe(
        tap((resp) => {
          const content = unwrapFinanceEnvelope<ChartOfAccountsContent>(resp);
          this.accounts = content?.accounts ?? [];
        }),
        catchError(() => {
          this.accounts = [];
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private fetchChargeTypes(): void {
    this.loading = true;
    this.loadFailed = false;

    this.financeLedgerService
      .getPmcChargeTypes(this.pmcId)
      .pipe(
        tap((resp) => {
          this.loading = false;
          const content = unwrapFinanceEnvelope<PmcChargeTypesContent>(resp);
          this.applyContent(content);
        }),
        catchError(() => {
          this.loading = false;
          this.loadFailed = true;
          this.chargeTypes = [];
          this.rows = [];
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private applyContent(content: PmcChargeTypesContent): void {
    this.chargeTypes = content?.charge_types ?? [];
    this.rows = this.chargeTypes.map((ct) => ({
      id: ct.id,
      charge_id: ct.charge_id,
      account_id: ct.account_id,
      charge_description: this.chargeDescription(ct.charge_id),
      account_name: ct.account_name,
      active: ct.active ? 'Yes' : 'No',
    }));
  }

  // Row-click affordance (mirrors ChartOfAccountsComponent's onRowClick):
  // opens the same inline form pre-filled for editing, using chargeTypes
  // (not the flattened display row) so charge_id/account_id/active are
  // typed correctly.
  onRowClick(row: Record<string, string | number>): void {
    const chargeType = this.chargeTypes.find((ct) => ct.id === row['id']);
    if (chargeType) {
      this.editRow(chargeType);
    }
  }

  private chargeDescription(chargeId: number): string {
    const charge = this.charges.find((c) => c.id === chargeId);
    return charge ? charge.description : `#${chargeId}`;
  }

  openAddForm(): void {
    this.showForm = true;
    this.formChargeId = null;
    this.formAccountId = null;
    this.formActive = true;
    this.saveError = null;
  }

  editRow(row: PmcChargeTypeRow): void {
    this.showForm = true;
    this.formChargeId = row.charge_id;
    this.formAccountId = row.account_id;
    this.formActive = row.active;
    this.saveError = null;
  }

  closeForm(): void {
    this.showForm = false;
    this.formChargeId = null;
    this.formAccountId = null;
    this.formActive = true;
    this.saveError = null;
  }

  submit(): void {
    if (this.saving || !this.pmcId) return;

    if (this.formChargeId === null || this.formAccountId === null) {
      this.saveError = 'FINANCE_PMC_CHARGE_TYPE_SELECT_REQUIRED';
      return;
    }

    this.saving = true;
    this.saveError = null;

    this.financeLedgerService
      .savePmcChargeType(
        this.pmcId,
        this.formChargeId,
        this.formAccountId,
        this.formActive,
      )
      .pipe(
        tap(() => {
          this.saving = false;
          this.closeForm();
          this.fetchChargeTypes();
        }),
        catchError(() => {
          // No inline error message beyond the flag: the global
          // http.interceptor.ts already toasts the backend's exact
          // `error.message` for any non-2xx response (matches
          // ManualEntryModalComponent's established convention).
          this.saving = false;
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
