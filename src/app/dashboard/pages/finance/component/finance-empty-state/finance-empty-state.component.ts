import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WhiteCardComponent } from '../../../../../shared/component/white-card/white-card.component';
import { FinanceActivationState } from '../../finance-activation.resolver';

/**
 * Story 2.2: shared empty-state extracted verbatim from Overview's inline
 * `app-white-card` blocks (Story 1.5), so every Finance report page renders
 * the same two "not activated" / "activated but no activity" messages
 * instead of duplicating them. `title` is an `@Input` (Overview hardcoded
 * `"Finance Overview"`) so each consumer passes its own page title.
 */
@Component({
  selector: 'app-finance-empty-state',
  standalone: true,
  imports: [CommonModule, WhiteCardComponent],
  templateUrl: './finance-empty-state.component.html',
})
export class FinanceEmptyStateComponent {
  @Input() financeActivation: FinanceActivationState = 'not_activated';
  @Input() title = '';
}
