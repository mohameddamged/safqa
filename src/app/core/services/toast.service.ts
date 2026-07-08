import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

/**
 * App-wide toast/snackbar notifications, backed by a signal so the
 * <app-toast-host> component (mounted once in the root App component)
 * re-renders reactively whenever a toast is pushed or dismissed.
 *
 * Any service or component can inject this directly - it doesn't depend
 * on Angular Material or any other UI library.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly autoDismissMs = 4000;

  readonly toasts = signal<Toast[]>([]);

  success(message: string): void {
    this.push('success', message);
  }

  error(message: string): void {
    this.push('error', message);
  }

  info(message: string): void {
    this.push('info', message);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(type: ToastType, message: string): void {
    const id = ++this.nextId;
    this.toasts.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), this.autoDismissMs);
  }
}
