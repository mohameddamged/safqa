import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProcurementService } from '../services/procurement.service';

@Component({
  selector: 'app-po-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './po-details.html',
  styleUrl: './po-details.css',
})
export class PoDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly rfqService = inject(ProcurementService);
  private readonly cdr = inject(ChangeDetectorRef);

  poId: number = 0;
  po: any = null;
  isLoading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.poId = Number(this.route.snapshot.paramMap.get('id'));
    this.rfqService.getPurchaseOrderById(this.poId).subscribe({
      next: (res: any) => {
        this.po = res?.data ?? res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load purchase order details.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  }

  getStatusClass(status: string): string {
    if (!status) return 'badge-gray';
    const s = status.toLowerCase();
    if (s.includes('accept') || s.includes('vendor')) return 'badge-green';
    if (s.includes('reject')) return 'badge-red';
    if (s.includes('pending')) return 'badge-yellow';
    return 'badge-gray';
  }
}