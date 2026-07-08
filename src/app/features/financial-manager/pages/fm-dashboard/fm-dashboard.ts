import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FmShell } from '../../components/fm-shell/fm-shell';
import { FinancialManagerService } from '../../services/financial-manager.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-fm-dashboard',
  standalone: true,
  imports: [CommonModule, FmShell],
  templateUrl: './fm-dashboard.html',
  styleUrl: './fm-dashboard.css',
})
export class FmDashboard implements OnInit {
  private readonly fmService   = inject(FinancialManagerService);
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  readonly user    = this.authService.currentUser;
  readonly loading = signal(true);

  // Stat card counts — derived from list endpoints
  readonly pendingPrCount       = signal(0);
  readonly pendingPoFund        = signal(0);
  readonly recoveredFundsCount  = signal(0);

  // Chart data (placeholder — no dedicated dashboard endpoint exists in backend)
  readonly offerAfterNegotiation = signal(65);
  readonly negotiationSavings    = signal(35);

  readonly monthlySpend = signal([
    { month: 'Jan', value: 200 },
    { month: 'Feb', value: 800 },
    { month: 'Mar', value: 600 },
    { month: 'Apr', value: 700 },
    { month: 'May', value: 450 },
    { month: 'Jun', value: 550 },
    { month: 'Jul', value: 900 },
  ]);

  private loadedCount = 0;
  private readonly TOTAL_LOADS = 3;

  ngOnInit(): void {
    // 1. Pending PR count
    this.fmService.getPendingPrs(1, 1).subscribe({
      next: (result) => {
        if (result.success && result.data) {
          this.pendingPrCount.set(result.data.totalCount);
        }
        this.checkLoaded();
      },
      error: () => this.checkLoaded(),
    });

    // 2. Pending PO invoices count
    this.fmService.getPendingPoInvoices(1, 1).subscribe({
      next: (result: any) => {
        if (result.success && result.data) {
          this.pendingPoFund.set(result.data.totalCount);
        }
        this.checkLoaded();
      },
      error: () => this.checkLoaded(),
    });

    // 3. Recovered funds count
    this.fmService.getRecoveredFunds(1, 1).subscribe({
      next: (result) => {
        if (result.success && result.data) {
          this.recoveredFundsCount.set(result.data.totalCount);
        }
        this.checkLoaded();
      },
      error: () => this.checkLoaded(),
    });
  }

  private checkLoaded(): void {
    this.loadedCount++;
    if (this.loadedCount >= this.TOTAL_LOADS) {
      this.loading.set(false);
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  // ── Donut chart ──────────────────────────────────────────────
  getDonutSegments(): string {
    const r = 60;
    const cx = 75;
    const cy = 75;
    const circumference = 2 * Math.PI * r;
    const teal   = (this.offerAfterNegotiation() / 100) * circumference;
    const orange = (this.negotiationSavings()    / 100) * circumference;
    return `
      <circle cx="${cx}" cy="${cy}" r="${r}"
        fill="none" stroke="#25B6AB" stroke-width="18"
        stroke-dasharray="${teal} ${circumference - teal}"
        stroke-dashoffset="${circumference * 0.25}"
      />
      <circle cx="${cx}" cy="${cy}" r="${r}"
        fill="none" stroke="#EFA063" stroke-width="18"
        stroke-dasharray="${orange} ${circumference - orange}"
        stroke-dashoffset="${circumference * 0.25 - teal}"
      />
    `;
  }

  // ── Line chart ────────────────────────────────────────────────
  getLinePath(): string {
    const data = this.monthlySpend();
    const max  = Math.max(...data.map(d => d.value));
    const w = 400; const h = 140; const padX = 20; const padY = 20;
    const points = data.map((d, i) => {
      const x = padX + (i / (data.length - 1)) * (w - padX * 2);
      const y = h - padY - ((d.value / max) * (h - padY * 2));
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  }

  getLinePoints(): { x: number; y: number; value: number }[] {
    const data = this.monthlySpend();
    const max  = Math.max(...data.map(d => d.value));
    const w = 400; const h = 140; const padX = 20; const padY = 20;
    return data.map((d, i) => ({
      x: padX + (i / (data.length - 1)) * (w - padX * 2),
      y: h - padY - ((d.value / max) * (h - padY * 2)),
      value: d.value,
    }));
  }
}
