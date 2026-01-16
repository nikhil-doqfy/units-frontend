import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-document-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-progress.component.html',
  styleUrl: './document-progress.component.css',
})
export class DocumentProgressComponent implements OnInit {
  @Input() documentsLeft: number = 6;
  @Input() totalDocuments: number = 10;
  strokeDashoffset: number = 0;
  progressColor: string = 'green';

  ngOnInit() {
    this.calculateProgress();
  }

  ngOnChanges() {
    this.calculateProgress();
  }

  calculateProgress() {
    const circleCircumference = 50 * 2 * Math.PI;
    const progress = this.documentsLeft / this.totalDocuments;
    this.strokeDashoffset = circleCircumference * (1 - progress);

    if (progress > 0.5) {
      this.progressColor = 'var(--greenText1)';
    } else if (progress > 0.25) {
      this.progressColor = 'var(--redText)';
    } else {
      this.progressColor = 'var(--redText1)';
    }
  }
}
