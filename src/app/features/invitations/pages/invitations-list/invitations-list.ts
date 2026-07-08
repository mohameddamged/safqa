import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { PrimaryButton } from '../../../../shared/components/primary-button/primary-button';
import { InviteUserDialog } from '../../components/invite-user-dialog/invite-user-dialog';
import { InvitationService } from '../../../../core/services/invitation.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';
import { InvitationListItem } from '../../../../core/models';



const PAGE_SIZE = 10;

/**
 * CompanyAdmin-only screen: paginated table of every invitation this
 * company has ever sent (GET Invitations), an "Invite teammate" button
 * that opens InviteUserDialog, and a Revoke action per Pending row
 * (PUT Invitations/{id}/revoke). No equivalent frame exists in the UI
 * design files supplied for Authentication, since this is admin/company
 * management territory - layout here follows the same visual language
 * (pill buttons, teal accents, Icon component) as the rest of the app
 * rather than a specific Figma frame.
 *
 * Mounted under a roleGuard([Role.CompanyAdmin])-protected route, NOT
 * under /auth or /account, since it has nothing to do with this admin's
 * own authentication - it manages OTHER people's invitations into their
 * company.
 *
 * Consumes:
 *   GET /api/Invitations?pageNumber=&pageSize=
 *   PUT /api/Invitations/{invitationId}/revoke
 */
@Component({
  selector: 'app-invitations-list',
  standalone: true,
  imports: [CommonModule, InviteUserDialog],
  templateUrl: './invitations-list.html',
  styleUrl: './invitations-list.css',
})
export class InvitationsList implements OnInit {
  private readonly invitationService = inject(InvitationService);
  private readonly toast = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.authService.currentUser;
  readonly loading = signal(true);
  readonly invitations = signal<InvitationListItem[]>([]);
  readonly pageNumber = signal(1);
  readonly totalCount = signal(0);
  readonly showInviteDialog = signal(false);
  readonly revokingId = signal<number | null>(null);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / PAGE_SIZE)));

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.loading.set(true);
    this.invitationService.getCompanyInvitations(page, PAGE_SIZE).subscribe({
      next: (result) => {
        this.loading.set(false);
        if (result.success && result.data) {
          this.invitations.set(result.data.items);
          this.pageNumber.set(result.data.pageNumber);
          this.totalCount.set(result.data.totalCount);
        } else {
          this.toast.error(result.message || 'Could not load invitations.');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.toast.error(err.error?.message ?? 'Could not load invitations.');
      },
    });
  }

  previousPage(): void {
    if (this.pageNumber() > 1) {
      this.loadPage(this.pageNumber() - 1);
    }
  }

  nextPage(): void {
    if (this.pageNumber() < this.totalPages()) {
      this.loadPage(this.pageNumber() + 1);
    }
  }

  openInviteDialog(): void {
    this.showInviteDialog.set(true);
  }

  handleInviteDialogClosed(): void {
    this.showInviteDialog.set(false);
  }

  handleInvited(): void {
    this.showInviteDialog.set(false);
    this.loadPage(1);
  }

  canRevoke(invitation: InvitationListItem): boolean {
    return invitation.status === 'Pending';
  }

  revoke(invitation: InvitationListItem): void {
    if (!this.canRevoke(invitation) || this.revokingId() !== null) {
      return;
    }

    this.revokingId.set(invitation.id);
    this.invitationService.revokeInvitation(invitation.id).subscribe({
      next: (result) => {
        this.revokingId.set(null);
        if (!result.success) {
          this.toast.error(result.message || 'Could not revoke invitation.');
          return;
        }
        this.toast.success('Invitation revoked.');
        this.loadPage(this.pageNumber());
      },
      error: (err: HttpErrorResponse) => {
        this.revokingId.set(null);
        this.toast.error(err.error?.message ?? 'Could not revoke invitation.');
      },
    });
  }

  statusClass(status: InvitationListItem['status']): string {
    return `status-badge status-badge--${status.toLowerCase()}`;
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
