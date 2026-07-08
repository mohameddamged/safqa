import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/**
 * Reproduces the recurring "success state" screens: green wavy/scalloped
 * badge with a checkmark, a short message, and a single CTA below. Used by
 * Password Created, Password Updated, Password Changed, and Sign-up
 * Success - the four success screens share identical structure and differ
 * only in title/message/button text, so they're driven by inputs rather
 * than four near-duplicate components.
 */
@Component({
  selector: 'app-result-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-panel.html',
  styleUrl: './result-panel.css',
})
export class ResultPanel {
  @Input() message = '';
}
