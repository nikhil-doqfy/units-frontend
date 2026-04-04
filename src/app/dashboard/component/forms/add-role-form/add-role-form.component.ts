import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ModalFormCardComponent } from '../../modal-form-card/modal-form-card.component';
import { NoDataComponent } from '../../../../no-data/no-data.component';

@Component({
  selector: 'app-add-role-form',
  standalone: true,
  imports: [ModalFormCardComponent, TranslateModule, ReactiveFormsModule, CommonModule, NoDataComponent],
  templateUrl: './add-role-form.component.html',
  styleUrl: './add-role-form.component.css',
})
export class AddRoleFormComponent {
  @Input() form!: FormGroup;

  get permissionsArray(): FormArray {
    return this.form.get('permissions') as FormArray;
  }

  permGroup(i: number): FormGroup {
    return this.permissionsArray.at(i) as FormGroup;
  }

  private readonly PERM_KEYS = ['create', 'edit', 'delete', 'view'];

  isRowAllSelected(i: number): boolean {
    const g = this.permGroup(i);
    return this.PERM_KEYS.every(k => g.get(k)?.value === true);
  }

  toggleRow(i: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const g = this.permGroup(i);
    this.PERM_KEYS.forEach(k => g.get(k)?.setValue(checked));
  }

  isAllSelected(): boolean {
    return this.permissionsArray.controls.length > 0 &&
      this.permissionsArray.controls.every((_, i) => this.isRowAllSelected(i));
  }

  isSomeSelected(): boolean {
    const total = this.permissionsArray.controls.length * this.PERM_KEYS.length;
    const checked = this.permissionsArray.controls.reduce((sum, _, i) => {
      return sum + this.PERM_KEYS.filter(k => this.permGroup(i).get(k)?.value === true).length;
    }, 0);
    return checked > 0 && checked < total;
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.permissionsArray.controls.forEach((_, i) => {
      this.PERM_KEYS.forEach(k => this.permGroup(i).get(k)?.setValue(checked));
    });
  }

  isColAllSelected(key: string): boolean {
    return this.permissionsArray.controls.length > 0 &&
      this.permissionsArray.controls.every((_, i) => this.permGroup(i).get(key)?.value === true);
  }

  isColSomeSelected(key: string): boolean {
    const checked = this.permissionsArray.controls.filter((_, i) => this.permGroup(i).get(key)?.value === true).length;
    return checked > 0 && checked < this.permissionsArray.controls.length;
  }

  toggleCol(key: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.permissionsArray.controls.forEach((_, i) => this.permGroup(i).get(key)?.setValue(checked));
  }
}
