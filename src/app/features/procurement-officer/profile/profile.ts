import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CompanyService } from '../../../core/services/company.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly authService    = inject(AuthService);
  private readonly companyService = inject(CompanyService);
  private readonly cdr            = inject(ChangeDetectorRef);

  // Personal info — from JWT claims (no API needed)
  firstName         = '';
  lastName          = '';
  phoneNumber       = '';
  profilePictureUrl = '';
  workEmail         = '';
  title             = 'Procurement Officer';

  // Company info — from GET /api/company/CompanyInfo
  companyName  = '';
  companyEmail = '';
  companyPhone = '';
  country      = '';
  stateRegion  = '';
  city         = '';
  street       = '';
  fullAddress  = '';

  isLoading = true;
  error: string | null = null;

  isEditing     = false;
  editFirstName = '';
  editLastName  = '';
  editPhone     = '';
  isSaving      = false;
  saveError: string | null = null;
  saveSuccess   = false;

  ngOnInit(): void {
    // Personal info from JWT
    const user = this.authService.currentUser();
    if (user) {
      this.firstName   = user.firstName   ?? '';
      this.lastName    = user.lastName    ?? '';
      this.phoneNumber = user.phoneNumber ?? '';
      this.workEmail   = user.email       ?? '';
    }

    // Company info from API
    this.companyService.getMyCompany().subscribe({
      next: (res: any) => {
        const d = res?.data ?? res;
        this.companyName  = d?.companyName            ?? '';
        this.companyEmail = d?.workEmail               ?? '';
        this.companyPhone = d?.phoneNumber             ?? '';
        this.country      = d?.address?.country        ?? '';
        this.stateRegion  = d?.address?.stateRegion    ?? '';
        this.city         = d?.address?.city            ?? '';
        this.street       = d?.address?.streetNumber    ?? '';
        this.fullAddress  = d?.address?.fullAddress     ?? '';
        this.isLoading    = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  startEdit(): void {
    this.editFirstName = this.firstName;
    this.editLastName  = this.lastName;
    this.editPhone     = this.phoneNumber;
    this.isEditing     = true;
    this.saveError     = null;
    this.saveSuccess   = false;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.saveError = null;
  }

  saveEdit(): void {
    if (this.isSaving) return;
    this.isSaving = true;
    setTimeout(() => {
      this.firstName   = this.editFirstName;
      this.lastName    = this.editLastName;
      this.phoneNumber = this.editPhone;
      this.isSaving    = false;
      this.isEditing   = false;
      this.saveSuccess = true;
      setTimeout(() => { this.saveSuccess = false; this.cdr.detectChanges(); }, 3000);
      this.cdr.detectChanges();
    }, 300);
  }
}
