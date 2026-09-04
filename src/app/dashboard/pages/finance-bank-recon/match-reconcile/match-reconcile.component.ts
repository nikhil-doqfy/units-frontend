import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FinanceService,
  BankStatementLine,
  UnreconciledJournalEntry,
} from '../../../../finance/finance.service';
import { WhiteCardComponent } from '../../../../shared/component/white-card/white-card.component';
import { SharedService } from '../../../../shared.service';
import { BreadCrumb } from '../../../../shared/model/shared.model';

export interface MatchPair {
  statementId: number;
  journalId: number;
  confirmed: boolean;
  rejected: boolean;
}

@Component({
  selector: 'app-match-reconcile',
  standalone: true,
  imports: [CommonModule, FormsModule, WhiteCardComponent],
  templateUrl: './match-reconcile.component.html',
  styleUrl: './match-reconcile.component.css',
})
export class MatchReconcileComponent implements OnInit {
  private financeService = inject(FinanceService);
  private sharedService = inject(SharedService);

  breadcrumbData: BreadCrumb[] = [];
  statementLines: BankStatementLine[] = [];
  journalEntries: UnreconciledJournalEntry[] = [];
  pairs: MatchPair[] = [];
  loading = true;

  selectedStatementId: number | null = null;
  selectedJournalId: number | null = null;

  confirmCount = 0;
  rejectCount = 0;

  ngOnInit(): void {
    this.sharedService
      .getBreadcrumbs([
        { label: 'Finance', link: '/dashboard/finance/overview' },
        { label: 'Bank Reconciliation', link: '' },
        { label: 'Match & Reconcile', link: '' },
      ])
      .subscribe((data) => (this.breadcrumbData = data));
    this.load();
  }

  load(): void {
    this.loading = true;
    let stmtDone = false,
      jeDone = false;

    this.financeService.getBankStatement().subscribe((data) => {
      this.statementLines = data.filter((r) => !r.matched);
      stmtDone = true;
      if (jeDone) {
        this.buildPairs();
        this.loading = false;
      }
    });

    this.financeService.getUnreconciledJournalEntries().subscribe((data) => {
      this.journalEntries = data;
      jeDone = true;
      if (stmtDone) {
        this.buildPairs();
        this.loading = false;
      }
    });
  }

  private buildPairs(): void {
    this.pairs = this.journalEntries
      .filter((je) => je.suggested_match !== undefined)
      .map((je) => ({
        statementId: je.suggested_match!,
        journalId: je.id,
        confirmed: false,
        rejected: false,
      }));
  }

  getStatement(id: number): BankStatementLine | undefined {
    return this.statementLines.find((s) => s.id === id);
  }
  getJournal(id: number): UnreconciledJournalEntry | undefined {
    return this.journalEntries.find((j) => j.id === id);
  }

  confirmPair(pair: MatchPair): void {
    pair.confirmed = true;
    pair.rejected = false;
    this.confirmCount++;
  }
  rejectPair(pair: MatchPair): void {
    pair.rejected = true;
    pair.confirmed = false;
    if (pair.confirmed) this.confirmCount--;
    this.rejectCount++;
  }
  undoPair(pair: MatchPair): void {
    if (pair.confirmed) this.confirmCount--;
    if (pair.rejected) this.rejectCount--;
    pair.confirmed = false;
    pair.rejected = false;
  }

  selectStatement(id: number): void {
    this.selectedStatementId = this.selectedStatementId === id ? null : id;
  }
  selectJournal(id: number): void {
    this.selectedJournalId = this.selectedJournalId === id ? null : id;
  }

  manualMatch(): void {
    if (!this.selectedStatementId || !this.selectedJournalId) return;
    const exists = this.pairs.find(
      (p) =>
        p.statementId === this.selectedStatementId &&
        p.journalId === this.selectedJournalId,
    );
    if (!exists) {
      this.pairs.push({
        statementId: this.selectedStatementId,
        journalId: this.selectedJournalId,
        confirmed: false,
        rejected: false,
      });
    }
    this.selectedStatementId = null;
    this.selectedJournalId = null;
  }

  isStatementPaired(id: number): boolean {
    return this.pairs.some(
      (p) => p.statementId === id && (p.confirmed || !p.rejected),
    );
  }
  isJournalPaired(id: number): boolean {
    return this.pairs.some(
      (p) => p.journalId === id && (p.confirmed || !p.rejected),
    );
  }

  get pendingPairs(): MatchPair[] {
    return this.pairs.filter((p) => !p.confirmed && !p.rejected);
  }
  get confirmedPairs(): MatchPair[] {
    return this.pairs.filter((p) => p.confirmed);
  }
}
