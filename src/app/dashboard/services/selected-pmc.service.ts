import { inject, Injectable, signal } from '@angular/core';
import { PmcService } from './pmc.service';
import { StorageService } from '../../shared/services/storage.service';
import { UserService } from '../../user/services/user.service';

export interface PmcOption {
  key: string;
  value: string;
}

/**
 * Single source of the navbar's "current PMC" selection.
 *
 * Loads the PMCs assigned to the logged-in user (Owner: via owned units;
 * Property Manager: via PMCPMMapping — see /owner/pmc), lets the header
 * dropdown switch between them, and persists the choice both locally and
 * on the user's own profile (`last_selected_pmc_id`), so it's restored
 * automatically next time they log in, on any device.
 */
@Injectable({
  providedIn: 'root',
})
export class SelectedPmcService {
  private pmcService = inject(PmcService);
  private storage = inject(StorageService);
  private userService = inject(UserService);

  pmcOptions = signal<PmcOption[]>([]);
  selectedPmc = signal<PmcOption | null>(null);
  private loaded = false;

  loadPmcs(): void {
    if (this.loaded) return;
    this.loaded = true;

    this.pmcService.getPMC({ limit: 1000, page: 1 }).subscribe({
      next: (resp: any) => {
        const options: PmcOption[] = (resp?.content ?? [])
          .filter((item: any) => item?.company_id != null)
          .map((item: any) => ({
            key: String(item.company_id),
            value: item.company_name ?? String(item.company_id),
          }));
        this.pmcOptions.set(options);

        // Preferred order: the profile's remembered choice (persists across
        // logins/devices) -> this browser's last local choice -> first option.
        const profilePmcId = this.storage.getUserProfile()?.last_selected_pmc_id;
        const localPmcId = this.storage.getSelectedPmcId();
        const savedId = profilePmcId != null ? String(profilePmcId) : localPmcId;
        const restored = savedId
          ? options.find((o) => o.key === savedId)
          : null;
        this.selectedPmc.set(restored ?? options[0] ?? null);
      },
      error: () => {
        this.pmcOptions.set([]);
        this.selectedPmc.set(null);
      },
    });
  }

  selectPmc(option: PmcOption | null): void {
    this.selectedPmc.set(option);
    if (!option) return;

    this.storage.setSelectedPmcId(option.key);
    // Best-effort — the local selection above already applied regardless
    // of whether this sync to the profile succeeds.
    this.userService
      .editUserProfile({ last_selected_pmc_id: option.key })
      .subscribe({ error: () => {} });
  }
}
