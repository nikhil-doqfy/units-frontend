import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-document-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-progress.component.html',
  styleUrl: './document-progress.component.css'
})

export class DocumentProgressComponent implements OnInit {
  @Input() documentsLeft: number = 6; // Dynamic number
  @Input() totalDocuments: number = 10; // Maximum documents
  strokeDashoffset: number = 0;
  progressColor: string = 'green'; // Default color

  ngOnInit() {
    this.calculateProgress();
  }

  ngOnChanges() {
    this.calculateProgress();
  }

  calculateProgress() {
    const circleCircumference = 50 * 2 * Math.PI; // SVG Circle (r=50)
    const progress = this.documentsLeft / this.totalDocuments;
    this.strokeDashoffset = circleCircumference * (1 - progress);

    // Change color dynamically
    if (progress > 0.5) {
      this.progressColor = 'var(--greenText1)'; // Above 50%
    } else if (progress > 0.25) {
      this.progressColor = 'var(--redText)'; // Light red (orange)
    } else {
      this.progressColor = 'var(--redText1)'; // Red (below 25%)
    }
  }
}

