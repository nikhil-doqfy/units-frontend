import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-auth-step-count',
  standalone: true,
  imports: [],
  templateUrl: './auth-step-count.component.html',
  styleUrl: './auth-step-count.component.css'
})
export class AuthStepCountComponent {
  @Input() stepNumber: string | undefined;
}
