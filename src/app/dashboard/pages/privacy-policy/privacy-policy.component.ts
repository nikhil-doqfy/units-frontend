import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedService } from '../../../shared.service';
import { PrivacyPolicyService } from '../../../privacy-policy.service';
import { ThemeService, UserRole } from '../../../theme.service';
import { DestroyRef, OnDestroy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface PolicyItem {
  id: number;
  title: string;
}

export interface PolicyContent {
  subtitle: string;
  content: string;
}

export interface DefaultPolicy {
  id: number;
  title: string;
  updated_at: string;
  other_policy_content: PolicyContent[];
}

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, FormsModule, WhiteCardComponent, TranslateModule],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css'],
})
export class PrivacyPolicyComponent {
  private route = inject(ActivatedRoute);
  private sharedService = inject(SharedService);
  private privacyPolicyService = inject(PrivacyPolicyService);
  private themeService = inject(ThemeService);
  private destroyRef = inject(DestroyRef);

  // ── View state ──────────────────────────────────────────────────────────
  defaultPolicy: DefaultPolicy | null = null;
  policies: PolicyItem[] = [];
  activePolicyId: number | null = null;
  isLoading = false;

  // ── Role ────────────────────────────────────────────────────────────────
  currentRole: UserRole = 'owner';
  get isPmc(): boolean {
    return (
      this.currentRole === 'owner' || this.currentRole === 'property-manager'
    );
  }

  // ── Add-policy form state ───────────────────────────────────────────────
  showAddForm = false;
  isSaving = false;
  saveError = '';

  formTitle = '';
  formSections: PolicyContent[] = [{ subtitle: '', content: '' }];

  constructor() {
    const key = this.route.snapshot.data['titleKey'];
    this.sharedService.setTitle(key);
  }

  ngOnInit(): void {
    this.sharedService.initLanguage();

    this.themeService.currentRole$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((role) => (this.currentRole = role));

    this.loadPolicies();
  }

  // ── Load ────────────────────────────────────────────────────────────────

  loadPolicies(): void {
    this.isLoading = true;
    this.privacyPolicyService.getPrivacyPolicy().subscribe({
      next: (resp: any) => {
        const content = resp?.content ?? resp;
        this.defaultPolicy = content?.default_policy ?? null;
        this.policies = content?.policies ?? [];
        if (this.defaultPolicy) {
          this.activePolicyId = this.defaultPolicy.id;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load policies:', err);
        this.isLoading = false;
      },
    });
  }

  selectPolicy(policy: PolicyItem): void {
    if (this.activePolicyId === policy.id) return;
    this.activePolicyId = policy.id;
    this.isLoading = true;
    this.defaultPolicy = null;

    this.privacyPolicyService.getPolicyById(policy.id).subscribe({
      next: (resp: any) => {
        this.defaultPolicy = resp?.content ?? resp;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load policy:', err);
        this.isLoading = false;
      },
    });
  }

  // ── Add-policy form ─────────────────────────────────────────────────────

  openAddForm(): void {
    this.formTitle = '';
    this.formSections = [{ subtitle: '', content: '' }];
    this.saveError = '';
    this.showAddForm = true;
  }

  cancelAddForm(): void {
    this.showAddForm = false;
    this.saveError = '';
  }

  addSection(): void {
    this.formSections.push({ subtitle: '', content: '' });
  }

  removeSection(index: number): void {
    if (this.formSections.length > 1) {
      this.formSections.splice(index, 1);
    }
  }

  savePolicy(): void {
    if (!this.formTitle.trim()) {
      this.saveError = 'Policy title is required.';
      return;
    }
    const hasEmpty = this.formSections.some(
      (s) => !s.subtitle.trim() || !s.content.trim(),
    );
    if (hasEmpty) {
      this.saveError = 'All section subtitle and content fields are required.';
      return;
    }

    this.isSaving = true;
    this.saveError = '';

    const payload = {
      title: this.formTitle.trim(),
      other_policy_content: this.formSections.map((s) => ({
        subtitle: s.subtitle.trim(),
        content: s.content.trim(),
      })),
    };

    this.privacyPolicyService.createPolicy(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.showAddForm = false;
        this.loadPolicies();
      },
      error: (err) => {
        console.error('Failed to save policy:', err);
        this.saveError = 'Failed to save. Please try again.';
        this.isSaving = false;
      },
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
