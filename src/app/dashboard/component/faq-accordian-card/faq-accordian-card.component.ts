import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlusIconComponent } from '../icons/plus-icon/plus-icon.component';
import { MinusIconComponent } from '../icons/minus-icon/minus-icon.component';

@Component({
	selector: 'app-faq-accordian-card',
	standalone: true,
	imports: [CommonModule, PlusIconComponent, MinusIconComponent],
	templateUrl: './faq-accordian-card.component.html',
	styleUrl: './faq-accordian-card.component.css'
})
export class FAQAccordianCardComponent {
	@Input() accordianData: { title: string, content: string }[] = [];
	@Output() accordionIndexChange = new EventEmitter<number>();
	@Output() accordionOpened = new EventEmitter<number>(); // New Output Event

	openAccordionIndex: number = -1; // Track the currently open accordion

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
