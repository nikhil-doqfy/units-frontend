import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-property-accordian-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './property-accordian-card.component.html',
  styleUrl: './property-accordian-card.component.css',
})
export class PropertyAccordianCardComponent {
  @Input() accordianData:
    | { title: string; items: { label: string; value: string }[] }[]
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
}
