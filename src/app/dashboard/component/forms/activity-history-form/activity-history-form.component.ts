import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-activity-history-form',
  standalone: true,
  imports: [],
  templateUrl: './activity-history-form.component.html',
  styleUrl: './activity-history-form.component.css',
})
export class ActivityHistoryFormComponent {
  @Input() editData: any = null;
  @Output() formSubmitted = new EventEmitter<any>();

  submitForm() {}
}
