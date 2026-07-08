import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Landing spot for roleGuard's redirect when a user lacks the required role. */
@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="max-width: 420px; margin: 96px auto; text-align: center;">
      <h1>403</h1>
      <p>You don't have permission to view this page.</p>
      <a routerLink="/auth/login">Back to Login</a>
    </div>
  `,
})
export class Unauthorized {}
