import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MembersService, TeamMember } from '../../../core/services/Company-Manager/members.service';
import { ToastService } from '../../../core/services/toast.service';
import { InvitationService } from '../../../core/services/invitation.service';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css'],
})
export class MembersComponent implements OnInit {
  readonly membersService = inject(MembersService);
  private readonly toast = inject(ToastService);
  private readonly invitationService = inject(InvitationService);

  readonly members = this.membersService.members;
  readonly loading = this.membersService.loading;
  readonly error = this.membersService.error;

  openMenuIndex: number | null = null;
  isSendingInvite = false;

  ngOnInit(): void {
    this.membersService.loadMembers().subscribe({
      error: () => this.toast.error('Could not load team members.'),
    });
  }

  toggleMenu(index: number, event: MouseEvent): void {
    event.stopPropagation();
    this.openMenuIndex = this.openMenuIndex === index ? null : index;
  }

  @HostListener('document:click')
  closeAllMenus(): void { this.openMenuIndex = null; }

  doAction(action: string, index: number): void {
    this.openMenuIndex = null;
    const member = this.members()[index];
    switch (action) {
      case 'edit-role':
        this.toast.error('Edit role coming soon.');
        break;
      case 'resend':
        this.invitationService.inviteUser({ email: member.email, role: member.position }).subscribe({
          next: () => this.toast.success('Invitation resent.'),
          error: () => this.toast.error('Could not resend invitation.'),
        });
        break;
      case 'suspend':
        this.members.update(m => {
          const copy = [...m];
          copy[index] = { ...member, status: 'Suspended' };
          return copy;
        });
        break;
      case 'activate':
        this.members.update(m => {
          const copy = [...m];
          copy[index] = { ...member, status: 'Active' };
          return copy;
        });
        break;
      case 'remove':
        this.members.update(m => m.filter((_, i) => i !== index));
        break;
    }
  }

  // ── Invite modal ──────────────────────────────────────────────────────────
  showModal = false;
  roleDropOpen = false;

  roles = [
    { value: 'Manager',            label: 'Department Manager'  },
    { value: 'ProcurementOfficer', label: 'Procurement Officer' },
    { value: 'FinanceManager',     label: 'Financial Manager'   },
    { value: 'InventoryOfficer',   label: 'Inventory Officer'   },
  ];

  form = { email: '', role: '', message: '' };

  openInviteModal(): void { this.showModal = true; }

  closeModal(): void {
    this.showModal = false;
    this.roleDropOpen = false;
    this.resetForm();
  }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.closeModal();
  }

  sendInvite(): void {
  if (!this.form.email || !this.form.role || this.isSendingInvite) return;
  this.isSendingInvite = true;

  this.invitationService.inviteUser({
    email: this.form.email,
    role: this.form.role  // string ✅
  }).subscribe({
    next: (res) => {
      this.isSendingInvite = false;
      if (res.success) {
        this.toast.success('Invitation sent successfully.');
        this.closeModal();
        this.membersService.loadMembers().subscribe();
      } else {
        this.toast.error(res.message || 'Could not send invitation.');
      }
    },
    error: (err) => {
      this.isSendingInvite = false;
      this.toast.error(err?.error?.message ?? 'Could not send invitation.');
    }
  });
}

  toggleRoleDrop(): void { this.roleDropOpen = !this.roleDropOpen; }
  closeRoleDrop(): void { this.roleDropOpen = false; }

  onRoleSelect(value: string): void {
    this.form.role = value;
    this.roleDropOpen = false;
  }

  getRoleLabel(value: string): string {
    return this.roles.find(r => r.value === value)?.label ?? '';
  }

  private resetForm(): void {
    this.form = { email: '', role: '', message: '' };
  }
}