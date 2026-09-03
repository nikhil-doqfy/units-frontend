import { Injectable, inject } from '@angular/core';
import { StorageService } from '../shared/services/storage.service';

export type PermissionAction = 'create' | 'edit' | 'delete' | 'view';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private storage = inject(StorageService);

  /**
   * Returns the permissions map from the stored user profile.
   * Format: { "Properties": { create: true, edit: false, ... }, "Finance": { ... }, ... }
   * Empty object means no restrictions (company admin / owner).
   */
  private getPermissions(): Record<string, Record<PermissionAction, boolean>> {
    const profile = this.storage.getUserProfile();
    return profile?.permissions ?? {};
  }

  /**
   * Returns true if the current user is a PropertyManager (staff).
   * Only PropertyManagers are permission-restricted.
   */
  isPropertyManager(): boolean {
    const profile = this.storage.getUserProfile();
    return profile?.user_role === 'COMPANY_USER';
  }

  /**
   * Check if the user has a specific action on a module.
   * Non-PropertyManagers always return true (unrestricted).
   */
  hasPermission(module: string, action: PermissionAction): boolean {
    if (!this.isPropertyManager()) return true;
    const perms = this.getPermissions();
    // If no permissions defined at all, deny access (role has no permissions yet)
    if (Object.keys(perms).length === 0) return false;
    return perms[module]?.[action] ?? false;
  }

  /**
   * Check if the user can access a module at all (has any permission on it).
   * Used by route guards.
   */
  canAccessModule(module: string): boolean {
    if (!this.isPropertyManager()) return true;
    const perms = this.getPermissions();
    if (Object.keys(perms).length === 0) return false;
    const mod = perms[module];
    if (!mod) return false;
    return mod.create || mod.edit || mod.delete || mod.view;
  }
}
