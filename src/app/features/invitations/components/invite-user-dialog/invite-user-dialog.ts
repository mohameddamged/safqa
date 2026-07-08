import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextInput } from '../../../../shared/components/text-input/text-input';
import { SelectInput, SelectOption } from '../../../../shared/components/select-input/select-input';
import { PrimaryButton } from '../../../../shared/components/primary-button/primary-button';
import { Icon } from '../../../../shared/components/icon/icon';
import { InvitationService } from '../../../../core/services/invitation.service';
import { ToastService } from '../../../../core/services/toast.service';
import { fieldError } from '../../../../shared/utils/field-error.util';
import { applyServerErrors } from '../../../../shared/utils/server-error.util';
import { ApiResult } from '../../../../core/models';

/**
 * Modal form for "Invite a teammate", opened from the invitations list
 * page. Loads the role dropdown from GET Invitations/company-roles on
 * open (rather than hardcoding CompanyRole locally) so any future role
 * the backend adds appears automatically without a frontend deploy.
 *
 * Emits `invited` after a successful POST Invitations so the parent list
 * page can refresh its table and close this dialog - this component has
 * no opinion on its own visibility (no @Input `open`), the parent
 * controls that via @if around <app-invite-user-dialog>.
 *
 * Consumes:
 *   GET  /api/Invitations/company-roles
 *   POST /api/Invitations
 */
@Component({
  selector: 'app-invite-user-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TextInput, SelectInput, PrimaryButton, Icon],
  templateUrl: './invite-user-dialog.html',
  styleUrl: './invite-user-dialog.css',
})
export class InviteUserDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly invitationService = inject(InvitationService);
  private readonly toast = inject(ToastService);

  @Output() closed = new EventEmitter<void>();
  @Output() invited = new EventEmitter<void>();

  readonly loading = signal(false);
  readonly loadingRoles = signal(true);
  readonly roleOptions = signal<SelectOption[]>([]);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    role: new FormControl<string | null>(null, [Validators.required]),
  });

  ngOnInit(): void {
    this.invitationService.getCompanyRoles().subscribe({
      next: (result) => {
        this.loadingRoles.set(false);
        if (result.success && result.data) {
          this.roleOptions.set(result.data.map((r) => ({ value: r.id, label: r.name })));
        } else {
          this.toast.error(result.message || 'Could not load roles.');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loadingRoles.set(false);
        this.toast.error(err.error?.message ?? 'Could not load roles.');
      },
    });
  }

  fieldError(name: string, label: string): string | null {
    return fieldError(this.form.get(name), label);
  }

  close(): void {
    this.closed.emit();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const value = this.form.getRawValue();

    this.invitationService
      .inviteUser({ email: value.email!, role: value.role! })
      .subscribe({
        next: (result) => {
          this.loading.set(false);

          if (!result.success) {
            applyServerErrors(this.form, result.errors);
            this.toast.error(result.message || 'Could not send invitation.');
            return;
          }

          this.toast.success('Invitation sent successfully.');
          this.invited.emit();
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          const body = err.error as ApiResult | undefined;
          if (body?.errors) {
            applyServerErrors(this.form, body.errors);
          }
          this.toast.error(body?.message ?? 'Could not send invitation. Please try again.');
        },
      });
  }
}
