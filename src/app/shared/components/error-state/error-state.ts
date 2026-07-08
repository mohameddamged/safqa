import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-state',
  imports: [CommonModule],
  templateUrl: './error-state.html',
  styleUrl: './error-state.css',
})
export class ErrorState {
  @Input() message: string = 'Something went wrong. Please try again.';
}
