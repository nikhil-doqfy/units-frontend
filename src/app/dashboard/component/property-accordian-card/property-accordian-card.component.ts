import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EditIconComponent } from '../../../user/component/icons/edit-icon/edit-icon.component';
import { PreviewIconComponent } from '../icons/preview-icon/preview-icon.component';
@Component({
  selector: 'app-property-accordian-card',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatTooltipModule,
    EditIconComponent,
    PreviewIconComponent,
  ],
  templateUrl: './property-accordian-card.component.html',
  styleUrl: './property-accordian-card.component.css',
})
export class PropertyAccordianCardComponent {
  private router = inject(Router);
  @Input() accordianData:
    | {
        title: string;
        items: {
          label: string;
          value: string;
          isLink?: boolean;
          unitId?: number;
          isAction?: boolean;
        }[];
        tableColumns?: { key: string; label: string }[];
        tableRows?: Record<string, string>[];
      }[]
    | undefined;
  @Output() accordionIndexChange = new EventEmitter<number>();
  @Output() accordionOpened = new EventEmitter<number>();

  openAccordionIndex: number = 0;
  isAccordionOpen(index: number): boolean {
    return this.openAccordionIndex === index;
  }

  onAccordionClick(index: number): void {
    this.openAccordionIndex = this.openAccordionIndex === index ? -1 : index;
    this.accordionOpened.emit(this.openAccordionIndex);
  }

  toggleAccordion(index: number): void {
    this.openAccordionIndex = this.openAccordionIndex === index ? -1 : index;
    this.accordionIndexChange.emit(this.openAccordionIndex);
  }

  updateAccordionIndex(index: number): void {
    this.openAccordionIndex = index;
    this.accordionIndexChange.emit(this.openAccordionIndex);
  }
  /*------units navigation------*/
  navigateToUnit(unitId?: number): void {
    if (!unitId) return;

    this.router.navigate(['/dashboard/units', unitId]);
  }
}
