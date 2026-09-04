import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SharedService } from '../shared.service';
import { environment } from '../../environments/environment';

// ── Shared interfaces ───────────────────────────────────────────────
export interface FinanceOverviewStats {
  cash_on_hand: number;
  total_ar_outstanding: number;
  net_pl_this_month: number;
  cheques_due_this_week: number;
  recent_journal_entries: JournalEntry[];
}

export interface JournalEntry {
  id: number;
  ref: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  posted_by: string;
}

export interface TrialBalanceLine {
  account_code: string;
  account_name: string;
  type: string;
  debit: number;
  credit: number;
}

export interface PLLine {
  section: 'income' | 'expense';
  account_code: string;
  account_name: string;
  amount: number;
}

export interface BSLine {
  section: 'asset' | 'liability' | 'equity';
  account_code: string;
  account_name: string;
  amount: number;
}

export interface AgeingRow {
  id: number;
  tenant: string;
  unit: string;
  ref: string;
  due_date: string;
  amount: number;
  days_overdue: number;
  bucket: 'Current' | '1-30' | '31-60' | '61-90' | '90+';
}

export interface ARRow {
  id: number;
  tenant: string;
  unit: string;
  property: string;
  ref: string;
  due_date: string;
  amount: number;
  status: 'Outstanding' | 'Partial' | 'Overdue';
}

export interface BankStatementLine {
  id: number;
  date: string;
  amount: number;
  reference: string;
  description: string;
  matched: boolean;
}

export interface UnreconciledJournalEntry {
  id: number;
  date: string;
  ref: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  suggested_match?: number;
}

// ─────────────────────────────────────────────────────────────────────
// Dummy data
// ─────────────────────────────────────────────────────────────────────

const OVERVIEW_DATA: FinanceOverviewStats = {
  cash_on_hand: 1265000,
  total_ar_outstanding: 348500,
  net_pl_this_month: 92400,
  cheques_due_this_week: 7,
  recent_journal_entries: [
    {
      id: 1,
      ref: 'JV-2026-0084',
      date: '2026-08-30',
      description: 'Rent income — Al Barsha Tower A',
      debit: 0,
      credit: 42000,
      posted_by: 'Ravi Shankar',
    },
    {
      id: 2,
      ref: 'JV-2026-0083',
      date: '2026-08-29',
      description: 'Commission expense — PMC fee Aug',
      debit: 4200,
      credit: 0,
      posted_by: 'Ravi Shankar',
    },
    {
      id: 3,
      ref: 'JV-2026-0082',
      date: '2026-08-28',
      description: 'Security deposit received — Tenant T-1092',
      debit: 15000,
      credit: 0,
      posted_by: 'Aisha Hamdan',
    },
    {
      id: 4,
      ref: 'JV-2026-0081',
      date: '2026-08-27',
      description: 'Bank charges — Emirates NBD Aug',
      debit: 350,
      credit: 0,
      posted_by: 'Ravi Shankar',
    },
    {
      id: 5,
      ref: 'JV-2026-0080',
      date: '2026-08-26',
      description: 'Maintenance & Repairs — JBR Unit 4B',
      debit: 1800,
      credit: 0,
      posted_by: 'Carlos Mendez',
    },
    {
      id: 6,
      ref: 'JV-2026-0079',
      date: '2026-08-25',
      description: 'Rental income — Downtown Residences',
      debit: 0,
      credit: 38500,
      posted_by: 'Ravi Shankar',
    },
    {
      id: 7,
      ref: 'JV-2026-0078',
      date: '2026-08-24',
      description: 'VAT payable — Aug 2026',
      debit: 0,
      credit: 2100,
      posted_by: 'Ravi Shankar',
    },
    {
      id: 8,
      ref: 'JV-2026-0077',
      date: '2026-08-22',
      description: 'Utility expense — DEWA Aug',
      debit: 1200,
      credit: 0,
      posted_by: 'Carlos Mendez',
    },
  ],
};

const TRIAL_BALANCE: TrialBalanceLine[] = [
  {
    account_code: 'ACC-1001',
    account_name: 'Cash & Cash Equivalents',
    type: 'Asset',
    debit: 1265000,
    credit: 0,
  },
  {
    account_code: 'ACC-1002',
    account_name: 'Accounts Receivable — Tenants',
    type: 'Asset',
    debit: 348500,
    credit: 0,
  },
  {
    account_code: 'ACC-1003',
    account_name: 'Prepaid Expenses',
    type: 'Asset',
    debit: 30000,
    credit: 0,
  },
  {
    account_code: 'ACC-1004',
    account_name: 'Property & Equipment',
    type: 'Asset',
    debit: 2500000,
    credit: 0,
  },
  {
    account_code: 'ACC-2001',
    account_name: 'AP — PMC Commission',
    type: 'Liability',
    debit: 0,
    credit: 85000,
  },
  {
    account_code: 'ACC-2002',
    account_name: 'Security Deposits Held',
    type: 'Liability',
    debit: 0,
    credit: 200000,
  },
  {
    account_code: 'ACC-2003',
    account_name: 'VAT Payable',
    type: 'Liability',
    debit: 0,
    credit: 12600,
  },
  {
    account_code: 'ACC-3001',
    account_name: 'Owner Equity',
    type: 'Equity',
    debit: 0,
    credit: 1800000,
  },
  {
    account_code: 'ACC-4001',
    account_name: 'Rent Income',
    type: 'Income',
    debit: 0,
    credit: 420000,
  },
  {
    account_code: 'ACC-4002',
    account_name: 'Service Charge Income',
    type: 'Income',
    debit: 0,
    credit: 38500,
  },
  {
    account_code: 'ACC-5001',
    account_name: 'Commission Expense',
    type: 'Expense',
    debit: 42000,
    credit: 0,
  },
  {
    account_code: 'ACC-5002',
    account_name: 'Maintenance & Repairs',
    type: 'Expense',
    debit: 18500,
    credit: 0,
  },
  {
    account_code: 'ACC-5003',
    account_name: 'Bank Charges',
    type: 'Expense',
    debit: 4200,
    credit: 0,
  },
  {
    account_code: 'ACC-5004',
    account_name: 'Utility Expense',
    type: 'Expense',
    debit: 14400,
    credit: 0,
  },
  {
    account_code: 'ACC-5005',
    account_name: 'Depreciation Expense',
    type: 'Expense',
    debit: 25000,
    credit: 0,
  },
];

const PL_DATA: PLLine[] = [
  {
    section: 'income',
    account_code: 'ACC-4001',
    account_name: 'Rent Income',
    amount: 420000,
  },
  {
    section: 'income',
    account_code: 'ACC-4002',
    account_name: 'Service Charge Income',
    amount: 38500,
  },
  {
    section: 'expense',
    account_code: 'ACC-5001',
    account_name: 'Commission Expense',
    amount: 42000,
  },
  {
    section: 'expense',
    account_code: 'ACC-5002',
    account_name: 'Maintenance & Repairs',
    amount: 18500,
  },
  {
    section: 'expense',
    account_code: 'ACC-5003',
    account_name: 'Bank Charges',
    amount: 4200,
  },
  {
    section: 'expense',
    account_code: 'ACC-5004',
    account_name: 'Utility Expense',
    amount: 14400,
  },
  {
    section: 'expense',
    account_code: 'ACC-5005',
    account_name: 'Depreciation Expense',
    amount: 25000,
  },
];

const BS_DATA: BSLine[] = [
  {
    section: 'asset',
    account_code: 'ACC-1001',
    account_name: 'Cash & Cash Equivalents',
    amount: 1265000,
  },
  {
    section: 'asset',
    account_code: 'ACC-1002',
    account_name: 'Accounts Receivable — Tenants',
    amount: 348500,
  },
  {
    section: 'asset',
    account_code: 'ACC-1003',
    account_name: 'Prepaid Expenses',
    amount: 30000,
  },
  {
    section: 'asset',
    account_code: 'ACC-1004',
    account_name: 'Property & Equipment',
    amount: 2500000,
  },
  {
    section: 'liability',
    account_code: 'ACC-2001',
    account_name: 'AP — PMC Commission',
    amount: 85000,
  },
  {
    section: 'liability',
    account_code: 'ACC-2002',
    account_name: 'Security Deposits Held',
    amount: 200000,
  },
  {
    section: 'liability',
    account_code: 'ACC-2003',
    account_name: 'VAT Payable',
    amount: 12600,
  },
  {
    section: 'equity',
    account_code: 'ACC-3001',
    account_name: 'Owner Equity',
    amount: 1800000,
  },
  {
    section: 'equity',
    account_code: 'ACC-3002',
    account_name: 'Retained Earnings',
    amount: 2045900,
  },
];

const AGEING_DATA: AgeingRow[] = [
  {
    id: 1,
    tenant: 'Mohammed Al Rashid',
    unit: 'A-101',
    ref: 'CHQ-2026-0441',
    due_date: '2026-08-01',
    amount: 18500,
    days_overdue: 31,
    bucket: '31-60',
  },
  {
    id: 2,
    tenant: 'Sara Johnson',
    unit: 'B-205',
    ref: 'CHQ-2026-0412',
    due_date: '2026-07-15',
    amount: 24000,
    days_overdue: 48,
    bucket: '31-60',
  },
  {
    id: 3,
    tenant: 'Aisha Hamdan',
    unit: 'C-310',
    ref: 'CHQ-2026-0390',
    due_date: '2026-06-30',
    amount: 16000,
    days_overdue: 63,
    bucket: '61-90',
  },
  {
    id: 4,
    tenant: 'James Okafor',
    unit: 'A-402',
    ref: 'CHQ-2026-0355',
    due_date: '2026-05-20',
    amount: 32000,
    days_overdue: 104,
    bucket: '90+',
  },
  {
    id: 5,
    tenant: 'Priya Nair',
    unit: 'D-112',
    ref: 'INV-2026-0221',
    due_date: '2026-08-25',
    amount: 9500,
    days_overdue: 7,
    bucket: '1-30',
  },
  {
    id: 6,
    tenant: 'Carlos Mendez',
    unit: 'B-308',
    ref: 'CHQ-2026-0468',
    due_date: '2026-09-01',
    amount: 21000,
    days_overdue: 0,
    bucket: 'Current',
  },
  {
    id: 7,
    tenant: 'Fatima Al Zaabi',
    unit: 'C-201',
    ref: 'CHQ-2026-0425',
    due_date: '2026-07-28',
    amount: 14500,
    days_overdue: 35,
    bucket: '31-60',
  },
  {
    id: 8,
    tenant: 'Ravi Shankar',
    unit: 'A-504',
    ref: 'INV-2026-0198',
    due_date: '2026-08-20',
    amount: 8200,
    days_overdue: 12,
    bucket: '1-30',
  },
  {
    id: 9,
    tenant: 'Omar Al Farsi',
    unit: 'D-305',
    ref: 'CHQ-2026-0333',
    due_date: '2026-05-01',
    amount: 42000,
    days_overdue: 123,
    bucket: '90+',
  },
  {
    id: 10,
    tenant: 'Deepak Patel',
    unit: 'B-101',
    ref: 'CHQ-2026-0480',
    due_date: '2026-08-30',
    amount: 18000,
    days_overdue: 2,
    bucket: 'Current',
  },
];

const AR_BY_TENANT: ARRow[] = [
  {
    id: 1,
    tenant: 'Mohammed Al Rashid',
    unit: 'A-101',
    property: 'Al Barsha Tower A',
    ref: 'CHQ-2026-0441',
    due_date: '2026-08-01',
    amount: 18500,
    status: 'Overdue',
  },
  {
    id: 2,
    tenant: 'Sara Johnson',
    unit: 'B-205',
    property: 'Downtown Residences',
    ref: 'CHQ-2026-0412',
    due_date: '2026-07-15',
    amount: 24000,
    status: 'Overdue',
  },
  {
    id: 3,
    tenant: 'Aisha Hamdan',
    unit: 'C-310',
    property: 'JBR Beachfront Units',
    ref: 'CHQ-2026-0390',
    due_date: '2026-06-30',
    amount: 16000,
    status: 'Overdue',
  },
  {
    id: 4,
    tenant: 'James Okafor',
    unit: 'A-402',
    property: 'Al Barsha Tower A',
    ref: 'CHQ-2026-0355',
    due_date: '2026-05-20',
    amount: 32000,
    status: 'Overdue',
  },
  {
    id: 5,
    tenant: 'Priya Nair',
    unit: 'D-112',
    property: 'Business Bay Offices',
    ref: 'INV-2026-0221',
    due_date: '2026-08-25',
    amount: 9500,
    status: 'Outstanding',
  },
  {
    id: 6,
    tenant: 'Carlos Mendez',
    unit: 'B-308',
    property: 'Downtown Residences',
    ref: 'CHQ-2026-0468',
    due_date: '2026-09-01',
    amount: 21000,
    status: 'Outstanding',
  },
  {
    id: 7,
    tenant: 'Fatima Al Zaabi',
    unit: 'C-201',
    property: 'JBR Beachfront Units',
    ref: 'CHQ-2026-0425',
    due_date: '2026-07-28',
    amount: 14500,
    status: 'Partial',
  },
  {
    id: 8,
    tenant: 'Ravi Shankar',
    unit: 'A-504',
    property: 'Al Barsha Tower A',
    ref: 'INV-2026-0198',
    due_date: '2026-08-20',
    amount: 8200,
    status: 'Outstanding',
  },
  {
    id: 9,
    tenant: 'Omar Al Farsi',
    unit: 'D-305',
    property: 'Business Bay Offices',
    ref: 'CHQ-2026-0333',
    due_date: '2026-05-01',
    amount: 42000,
    status: 'Overdue',
  },
  {
    id: 10,
    tenant: 'Deepak Patel',
    unit: 'B-101',
    property: 'Downtown Residences',
    ref: 'CHQ-2026-0480',
    due_date: '2026-08-30',
    amount: 18000,
    status: 'Outstanding',
  },
];

const AR_BY_UNIT: ARRow[] = AR_BY_TENANT.slice().sort((a, b) =>
  a.unit.localeCompare(b.unit),
);

const BANK_STATEMENT: BankStatementLine[] = [
  {
    id: 1,
    date: '2026-08-30',
    amount: 42000,
    reference: 'CHQ-0441',
    description: 'Rent — Al Rashid M.',
    matched: true,
  },
  {
    id: 2,
    date: '2026-08-29',
    amount: -4200,
    reference: 'PMT-0083',
    description: 'Commission payment PMC',
    matched: true,
  },
  {
    id: 3,
    date: '2026-08-28',
    amount: 15000,
    reference: 'DEP-0092',
    description: 'Security deposit T-1092',
    matched: false,
  },
  {
    id: 4,
    date: '2026-08-27',
    amount: -350,
    reference: 'CHG-BNK',
    description: 'Bank charge Aug 2026',
    matched: false,
  },
  {
    id: 5,
    date: '2026-08-26',
    amount: 38500,
    reference: 'CHQ-0468',
    description: 'Rent — Downtown Res.',
    matched: false,
  },
  {
    id: 6,
    date: '2026-08-25',
    amount: -1200,
    reference: 'PMT-DEWA',
    description: 'DEWA utility Aug',
    matched: false,
  },
  {
    id: 7,
    date: '2026-08-22',
    amount: 21000,
    reference: 'CHQ-0425',
    description: 'Rent — Al Zaabi F.',
    matched: false,
  },
  {
    id: 8,
    date: '2026-08-20',
    amount: -1800,
    reference: 'PMT-MNT',
    description: 'Maintenance JBR 4B',
    matched: false,
  },
];

const UNRECONCILED_JE: UnreconciledJournalEntry[] = [
  {
    id: 1,
    date: '2026-08-28',
    ref: 'JV-2026-0082',
    description: 'Security deposit received T-1092',
    amount: 15000,
    type: 'debit',
    suggested_match: 3,
  },
  {
    id: 2,
    date: '2026-08-27',
    ref: 'JV-2026-0081',
    description: 'Bank charges Emirates NBD Aug',
    amount: 350,
    type: 'debit',
    suggested_match: 4,
  },
  {
    id: 3,
    date: '2026-08-26',
    ref: 'JV-2026-0080',
    description: 'Rental income Downtown Residences',
    amount: 38500,
    type: 'credit',
    suggested_match: 5,
  },
  {
    id: 4,
    date: '2026-08-25',
    ref: 'JV-2026-0079',
    description: 'DEWA utility expense Aug',
    amount: 1200,
    type: 'debit',
    suggested_match: 6,
  },
  {
    id: 5,
    date: '2026-08-22',
    ref: 'JV-2026-0078',
    description: 'Rent receipt Al Zaabi Fatima',
    amount: 21000,
    type: 'credit',
    suggested_match: 7,
  },
  {
    id: 6,
    date: '2026-08-20',
    ref: 'JV-2026-0077',
    description: 'Maintenance JBR Unit 4B',
    amount: 1800,
    type: 'debit',
    suggested_match: 8,
  },
];

// ─────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  // ── Overview ─────────────────────────────────────────────────────
  getOverviewStats(): Observable<FinanceOverviewStats> {
    return of(OVERVIEW_DATA);
    // real: return this.http.get<FinanceOverviewStats>(`${this.SERVER_ADDRESS}/finance/overview`);
  }

  // ── Reports ──────────────────────────────────────────────────────
  getTrialBalance(
    params: Record<string, any> = {},
  ): Observable<TrialBalanceLine[]> {
    return of(TRIAL_BALANCE);
    // real: const qs = this.sharedService.getQueryString(params);
    // return this.http.get<TrialBalanceLine[]>(`${this.SERVER_ADDRESS}/finance/trial-balance${qs}`);
  }

  getProfitAndLoss(params: Record<string, any> = {}): Observable<PLLine[]> {
    return of(PL_DATA);
  }

  getBalanceSheet(params: Record<string, any> = {}): Observable<BSLine[]> {
    return of(BS_DATA);
  }

  getAgeingReport(params: Record<string, any> = {}): Observable<AgeingRow[]> {
    return of(AGEING_DATA);
  }

  // ── Accounts Receivable ──────────────────────────────────────────
  getARByTenant(params: Record<string, any> = {}): Observable<ARRow[]> {
    return of(AR_BY_TENANT);
  }

  getARByUnit(params: Record<string, any> = {}): Observable<ARRow[]> {
    return of(AR_BY_UNIT);
  }

  // ── Bank Reconciliation ──────────────────────────────────────────
  getBankStatement(
    params: Record<string, any> = {},
  ): Observable<BankStatementLine[]> {
    return of(BANK_STATEMENT);
  }

  getUnreconciledJournalEntries(
    params: Record<string, any> = {},
  ): Observable<UnreconciledJournalEntry[]> {
    return of(UNRECONCILED_JE);
  }

  uploadBankStatement(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(
      `${this.SERVER_ADDRESS}/finance/bank-statement/import`,
      formData,
    );
  }

  confirmMatch(statementId: number, journalId: number): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/finance/reconcile/match`, {
      statementId,
      journalId,
    });
  }
}
