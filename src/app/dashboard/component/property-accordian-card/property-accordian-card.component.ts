import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-property-accordian-card',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './property-accordian-card.component.html',
	styleUrl: './property-accordian-card.component.css'
})
export class PropertyAccordianCardComponent {
	@Input() accordianData: { title: string; items: { label: string; value: string; }[]; }[] | undefined;
	@Output() accordionIndexChange = new EventEmitter<number>();
	@Output() accordionOpened = new EventEmitter<number>(); // New Output Event

	openAccordionIndex: number = 0; // Track the currently open accordion

	isAccordionOpen(index: number): boolean {
		return this.openAccordionIndex === index;
	}

	onAccordionClick(index: number): void {
		this.openAccordionIndex = this.openAccordionIndex === index ? -1 : index;
		this.accordionOpened.emit(this.openAccordionIndex); // Emit open accordion index
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
