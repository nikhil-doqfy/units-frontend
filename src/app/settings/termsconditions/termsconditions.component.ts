import { Component, DestroyRef, inject } from '@angular/core';
import { WhiteCardComponent } from '../../shared/component/white-card/white-card.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EditIconComponent } from '../../user/component/icons/edit-icon/edit-icon.component';
import { BreadCrumb } from '../../shared/model/shared.model';
import { SharedService } from '../../shared.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TermsConditionService } from '../../terms-condition.service';
import {
  PrivacyPolicyService,
  PolicyContent,
} from '../../privacy-policy.service';
import { ThemeService, UserRole } from '../../theme.service';

@Component({
  selector: 'app-termsconditions',
  standalone: true,
  imports: [
    WhiteCardComponent,
    CommonModule,
    FormsModule,
    TranslateModule,
    EditIconComponent,
  ],
  templateUrl: './termsconditions.component.html',
  styleUrl: './termsconditions.component.css',
})
export class TermsconditionsComponent {
  private termsCondition = inject(TermsConditionService);
  private privacyPolicyService = inject(PrivacyPolicyService);
  private themeService = inject(ThemeService);
  private destroyRef = inject(DestroyRef);
  private translate = inject(TranslateService);
  private sharedService = inject(SharedService);

  currentLanguage = 'en';
  activeTab: string = 'login';

  // ── Role ─────────────────────────────────────────────────────────────
  currentRole: UserRole = 'owner';
  get isPmc(): boolean {
    return (
      this.currentRole === 'owner' || this.currentRole === 'property-manager'
    );
  }

  // ── Loaded policies list (from GET /user/privacy_policy) ──────────────
  policies: any[] = [];
  isLoadingPolicies = false;
  activePolicyId: number | null = null;
  activePolicy: any = null;

  // ── Add form state ────────────────────────────────────────────────────
  showAddForm = false;
  isSaving = false;
  saveError = '';
  saveSuccess = false;

  addFormTitle = '';
  addFormSections: PolicyContent[] = [{ subtitle: '', content: '' }];

  // ── Inline edit state (per-policy) ───────────────────────────────────
  editingMap: { [id: number]: { title: string; sections: PolicyContent[] } } =
    {};
  savingMap: { [id: number]: boolean } = {};

  breadcrumbData: BreadCrumb[] = [];

  ngOnInit() {
    this.loadBreadcrumb();
    this.sharedService.initLanguage();
    this.initLanguageListener();

    this.themeService.currentRole$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((role) => (this.currentRole = role));

    this.loadPolicies();
  }

  initLanguageListener() {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadBreadcrumb());
  }

  loadBreadcrumb() {
    this.setBreadCrumb([
      { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
      { label: 'PAGE_TITLE.TERMS_AND_CONDITIONS', link: '' },
    ]);
  }

  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }

  // ── Load policies ─────────────────────────────────────────────────────

  loadPolicies(): void {
    this.isLoadingPolicies = true;
    this.privacyPolicyService.getPrivacyPolicy().subscribe({
      next: (resp: any) => {
        const content = resp?.content ?? resp;
        const defPolicy = content?.default_policy ?? null;
        const list: any[] = content?.policies ?? [];

        if (defPolicy) {
          const exists = list.some((p) => p.id === defPolicy.id);
          if (!exists) list.unshift(defPolicy);
          const idx = list.findIndex((p) => p.id === defPolicy.id);
          if (idx !== -1) list[idx] = defPolicy;
        }

        this.policies = list;

        if (this.policies.length > 0 && !this.activePolicyId) {
          this.activePolicyId = this.policies[0].id;
          this.activePolicy = this.policies[0];
        } else if (this.activePolicyId) {
          const found = this.policies.find((p) => p.id === this.activePolicyId);
          if (found) this.activePolicy = found;
        }

        this.isLoadingPolicies = false;
      },
      error: (err) => {
        console.error('Failed to load policies:', err);
        this.isLoadingPolicies = false;
      },
    });
  }

  // ── Select policy ─────────────────────────────────────────────────────

  selectPolicy(policy: any): void {
    if (this.activePolicyId === policy.id) return;
    this.activePolicyId = policy.id;
    this.activePolicy = null;

    // Cancel any ongoing edits
    delete this.editingMap[policy.id];

    this.isLoadingPolicies = true;
    this.privacyPolicyService.getPolicyById(policy.id).subscribe({
      next: (resp: any) => {
        this.activePolicy = resp?.content ?? resp;
        this.isLoadingPolicies = false;
      },
      error: (err) => {
        console.error('Failed to load policy:', err);
        this.isLoadingPolicies = false;
      },
    });
  }

  // ── Add form ──────────────────────────────────────────────────────────

  openAddForm(): void {
    this.addFormTitle = '';
    this.addFormSections = [{ subtitle: '', content: '' }];
    this.saveError = '';
    this.saveSuccess = false;
    this.showAddForm = true;
  }

  cancelAddForm(): void {
    this.showAddForm = false;
    this.saveError = '';
  }

  addSection(): void {
    this.addFormSections.push({ subtitle: '', content: '' });
  }

  removeSection(index: number): void {
    if (this.addFormSections.length > 1) {
      this.addFormSections.splice(index, 1);
    }
  }

  saveNewPolicy(): void {
    if (!this.addFormTitle.trim()) {
      this.saveError = 'Policy title is required.';
      return;
    }
    const hasEmpty = this.addFormSections.some(
      (s) => !s.subtitle.trim() || !s.content.trim(),
    );
    if (hasEmpty) {
      this.saveError = 'All section subtitle and content fields are required.';
      return;
    }

    this.isSaving = true;
    this.saveError = '';

    const payload = {
      title: this.addFormTitle.trim(),
      other_policy_content: this.addFormSections.map((s) => ({
        subtitle: s.subtitle.trim(),
        content: s.content.trim(),
      })),
    };

    this.privacyPolicyService.createPolicy(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.saveSuccess = true;
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

  // ── Inline edit per policy ────────────────────────────────────────────

  isEditing(policy: any): boolean {
    return !!this.editingMap[policy.id];
  }

  startEdit(policy: any): void {
    const source = this.activePolicy ?? policy;
    this.editingMap[source.id] = {
      title: source.title ?? '',
      sections: (source.other_policy_content ?? []).map((s: PolicyContent) => ({
        subtitle: s.subtitle,
        content: s.content,
      })),
    };
  }

  cancelEdit(policy: any): void {
    delete this.editingMap[policy.id];
  }

  addEditSection(policyId: number): void {
    this.editingMap[policyId].sections.push({ subtitle: '', content: '' });
  }

  removeEditSection(policyId: number, index: number): void {
    if (this.editingMap[policyId].sections.length > 1) {
      this.editingMap[policyId].sections.splice(index, 1);
    }
  }

  saveEdit(policy: any): void {
    const draft = this.editingMap[policy.id];
    if (!draft) return;

    if (!draft.title.trim()) return;
    const hasEmpty = draft.sections.some(
      (s) => !s.subtitle.trim() || !s.content.trim(),
    );
    if (hasEmpty) return;

    this.savingMap[policy.id] = true;

    const payload = {
      id: policy.id,
      title: draft.title.trim(),
      other_policy_content: draft.sections.map((s) => ({
        subtitle: s.subtitle.trim(),
        content: s.content.trim(),
      })),
    };

    this.privacyPolicyService.updatePolicy(policy.id, payload).subscribe({
      next: () => {
        this.savingMap[policy.id] = false;
        delete this.editingMap[policy.id];
        this.loadPolicies(); // refresh
      },
      error: (err) => {
        console.error('Failed to update policy:', err);
        this.savingMap[policy.id] = false;
      },
    });
  }
}
