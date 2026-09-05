import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Rendered only when `financeLandingGuard` finds zero reachable PMCs
 * (no redirect target exists). A real "no reachable PMC" empty-state
 * treatment is Story 1.5's concern; this is a minimal placeholder so the
 * no-redirect-loop edge case has somewhere safe to land.
 */
@Component({
  selector: 'app-finance-landing',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `<div class="white-card">{{ "FINANCE_NO_PMC_FOUND" | translate }}</div>`,
})
export class FinanceLandingComponent {}
