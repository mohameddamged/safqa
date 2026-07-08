import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Icon, IconName } from '../icon/icon';
import { ToastService, ToastType } from '../../../core/services/toast.service';

/**
 * Renders the live toast list from ToastService. Mounted once in
 * App's root template (app.html), outside <router-outlet>, so toasts
 * survive route changes and never get destroyed mid-animation by
 * navigation.
 */
@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [CommonModule, Icon],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class ToastHost {
  private readonly toastService = inject(ToastService);

  readonly toasts = this.toastService.toasts;

  readonly icons: Record<ToastType, IconName> = {
    success: 'circle-check',
    error: 'circle-x',
    info: 'info',
  };

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
