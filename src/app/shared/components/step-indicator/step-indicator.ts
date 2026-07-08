import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Icon } from '../icon/icon';

/**
 * Three-step circle/line indicator seen at the bottom of the Forgot
 * Password flow (email -> OTP -> new password) and the Sign-up flow
 * (account details -> OTP -> address). `currentStep` is 1-indexed;
 * steps before it render a filled checkmark circle, the current step
 * renders an outlined number, and steps after it render a faint outline.
 */
@Component({
  selector: 'app-step-indicator',
  standalone: true,
  imports: [CommonModule, Icon],
  templateUrl: './step-indicator.html',
  styleUrl: './step-indicator.css',
})
export class StepIndicator {
  @Input() totalSteps = 3;
  @Input() currentStep = 1;

  get steps(): number[] {
    return Array.from({ length: this.totalSteps }, (_, i) => i + 1);
  }

  stepState(step: number): 'done' | 'current' | 'upcoming' {
    if (step < this.currentStep) return 'done';
    if (step === this.currentStep) return 'current';
    return 'upcoming';
  }
}
