import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-timer-text',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timer-text.component.html',
  styleUrl: './timer-text.component.css',
})
export class TimerTextComponent {
  @Input() time: string | undefined;

  @Input() label: string = 'Resend verification code in';
  @Input() customStyle: string = '';
}
