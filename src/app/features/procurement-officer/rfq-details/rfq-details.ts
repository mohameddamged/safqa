import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProcurementService } from '../services/procurement.service';

@Component({
  selector: 'app-rfq-details',
  imports: [CommonModule, RouterModule],
  templateUrl: './rfq-details.html',
  styleUrl: './rfq-details.css',
})
export class RFQDetails implements OnInit {
  private readonly route      = inject(ActivatedRoute);
  private readonly rfqService = inject(ProcurementService);

  rfq: any = null;
  isLoading = true;
  error: string | null = null;

ngOnInit(): void {
  const id = Number(this.route.snapshot.paramMap.get('id'));

  // Try router state first (instant — no API call)
  const statePr = history.state?.pr;
  if (statePr && statePr.id === id) {
    this.rfq = statePr;
    this.isLoading = false;
    return;
  }

  // Fallback: fetch from API (on page refresh)
  this.rfqService.getPRById(id).subscribe({
    next: (res: any) => {
      this.isLoading = false;
      this.rfq = res?.data ?? res;
    },
    error: () => {
      this.isLoading = false;
      this.error = 'Failed to load PR details.';
    },
  });
}
  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  }
}
