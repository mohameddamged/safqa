import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../../core/services/Vendor-Admin/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-host.component.html',
  styleUrls: ['./toast-host.component.css']
})
export class ToastHostComponent {
  constructor(public toastService: ToastService) {}

  lines(message: string): string[] {
    return (message ?? '').split('\n').filter(Boolean);
  }

  close(id: number): void {
    this.toastService.dismiss(id);
  }
}
