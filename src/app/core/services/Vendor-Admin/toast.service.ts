import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message: string;
}

/**
 * App-wide toast/notification service. Replaces browser alert() with a small,
 * dismissible, auto-expiring message rendered by <app-toast-host> (mounted once
 * in the root component) so any component can call toast.error(...) / .success(...)
 * without wiring up its own UI.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  readonly toasts = signal<Toast[]>([]);

  private push(type: ToastType, message: string, title?: string, durationMs = 5000): void {
    const id = this.nextId++;
    const toast: Toast = {
      id,
      type,
      title: title ?? this.defaultTitle(type),
      message,
    };
    this.toasts.update(list => [...list, toast]);

    if (durationMs > 0) {
      setTimeout(() => this.dismiss(id), durationMs);
    }
  }

  private defaultTitle(type: ToastType): string {
    if (type === 'success') return 'Success';
    if (type === 'error') return 'Something went wrong';
    return 'Notice';
  }

  success(message: string, title?: string): void {
    this.push('success', message, title);
  }

  error(message: string, title?: string): void {
    this.push('error', message, title, 7000);
  }

  info(message: string, title?: string): void {
    this.push('info', message, title);
  }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
