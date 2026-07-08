import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FmShell } from '../../components/fm-shell/fm-shell';
import { PrimaryButton } from '../../../../shared/components/primary-button/primary-button';
import { FinancialManagerService } from '../../services/financial-manager.service';
import { ToastService } from '../../../../core/services/toast.service';
import { FmPrDetails } from '../../models';

@Component({
  selector: 'app-fm-pr-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FmShell, PrimaryButton],
  templateUrl: './pr-details.html',
  styleUrl: './pr-details.css',
})
export class PrDetails implements OnInit {
  private readonly fmService = inject(FinancialManagerService);
  private readonly toast     = inject(ToastService);
  private readonly route     = inject(ActivatedRoute);
  private readonly router    = inject(Router);

  private prId = 0;

  readonly loading      = signal(true);
  readonly errored      = signal(false);
  readonly errorMessage = signal('Could not load this PR. It may have already been processed.');
  readonly submitting   = signal(false);
  readonly pr           = signal<FmPrDetails | null>(null);

  // Notes for approve / reject — optional, sent as query param
  notes = '';

  // Confirmation dialog state
  readonly showConfirm   = signal(false);
  pendingDecision: 'approve' | 'reject' | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!idParam || Number.isNaN(id)) {
      this.router.navigate(['/financial-manager/pending-prs']);
      return;
    }

    this.prId = id;

    this.fmService.getPrDetails(id).subscribe({
      next: (result) => {
        this.loading.set(false);
        if (!result.success || !result.data) {
          this.errored.set(true);
          this.errorMessage.set(
            result.message || 'Could not load this PR. It may have already been processed.',
          );
          return;
        }
        this.pr.set(result.data);
      },
      error: (err) => {
        this.loading.set(false);
        this.errored.set(true);
        this.errorMessage.set(
          err?.error?.message ?? 'Could not load this PR. It may have already been processed.',
        );
      },
    });
  }

  // Open confirmation dialog
  confirmSendToProcurement(): void {
    this.pendingDecision = 'approve';
    this.showConfirm.set(true);
  }

  confirmReject(): void {
    this.pendingDecision = 'reject';
    this.showConfirm.set(true);
  }

  cancelConfirm(): void {
    this.showConfirm.set(false);
    this.pendingDecision = null;
  }

  // Execute confirmed decision
  executeDecision(): void {
    if (!this.pendingDecision || this.submitting()) return;
    this.showConfirm.set(false);
    this.submitDecision(this.pendingDecision);
    this.pendingDecision = null;
  }

  private submitDecision(decision: 'approve' | 'reject'): void {
    this.submitting.set(true);

    const call =
      decision === 'approve'
        ? this.fmService.approvePr(this.prId, this.notes || undefined)
        : this.fmService.rejectPr(this.prId, this.notes || undefined);

    call.subscribe({
      next: (result) => {
        this.submitting.set(false);
        if (!result.success) {
          this.toast.error(result.message || 'Could not submit your decision. Please try again.');
          return;
        }
        this.toast.success(
          decision === 'approve' ? 'PR sent to Procurement.' : 'PR request rejected.',
        );
        this.router.navigate(['/financial-manager/pending-prs']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.toast.error(
          err?.error?.message ?? 'Could not submit your decision. Please try again.',
        );
      },
    });
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB');
  }
}
