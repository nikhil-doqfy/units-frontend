import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-timer-text',
  standalone: true,
  imports: [],
  templateUrl: './timer-text.component.html',
  styleUrl: './timer-text.component.css',
})
export class TimerTextComponent {
  @Input() time: string | undefined;

  @Input() label: string = 'Resend verification code in';
}
