import { Component } from '@angular/core';
import { CircularCrossBtnIconComponent } from '../../../icons/circular-cross-btn-icon/circular-cross-btn-icon.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-tenant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './new-tenant.component.html',
  styleUrl: './new-tenant.component.css',
})
export class NewTenantComponent {
  step = 1;
  onboardingStep = 1;

  saveNext() {
    this.step = 2;
  }

  sendInvite() {
    this.step = 3;
  }

  nextOnboarding() {
    if (this.onboardingStep < 3) {
      this.onboardingStep++;
    } else {
      this.step++;
    }
  }

  next() {
    this.step++;
  }

  steps = [
    { label: 'Invite', route: '/invite' },
    { label: 'Onboarding', route: '/onboarding' },
    { label: 'Agreement', route: '/agreement' },
    { label: 'Ejari', route: '/ejari' },
    { label: 'Activated', route: '/activated' },
  ];

  currentStep = 0;

  constructor(private router: Router) {}

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.router.navigate([this.steps[this.currentStep].route]);
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.router.navigate([this.steps[this.currentStep].route]);
    }
  }
}
