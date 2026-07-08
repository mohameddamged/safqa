import { Component, HostListener, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BankAccountInfo, BankAccountService } from '../../../core/services/Vendor-Admin/bank-account.service';
import {
  VendorProfileService,
  VendorProfileData,
  ApiResponse,
} from '../../../core/services/Vendor-Admin/vendor-profile.service';

@Component({
  selector: 'app-vendor-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendor-profile.component.html',
  styleUrls: ['./vendor-profile.component.css']
})
export class VendorProfileComponent implements OnInit {

  constructor(
    private router: Router,
    public bankSvc: BankAccountService,
    private profileSvc: VendorProfileService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
  ) {}

  vendorName   = '';
  plan         = 'Free Plan';
  planLoading  = false;

  loading      = false;
  errorMessage = '';

  avatarUrl: string | null = null;
  doc1Url:   string | null = null;
  doc2Url:   string | null = null;

  avatarUploading = false;
  avatarError     = '';

  taxId       = '';
  workEmail   = '';
  phoneNumber = '';
  country     = '';
  stateRegion = '';
  city        = '';
  street      = '';
  fullAddress = '';

  isEditingName = false;
  editNameTemp  = '';
  nameSaving    = false;
  nameError     = '';

  showDropdown = false;

  ngOnInit(): void {
    this.loadProfile();
  }

  // GET /api/VendorProfile/profile
  loadProfile(): void {
    this.loading      = true;
    this.errorMessage = '';

    this.profileSvc.getProfile().subscribe({
      next: (res: ApiResponse<VendorProfileData>) => {
        this.zone.run(() => {
          this.loading = false;
          if (res?.success && res.data) {
            const d = res.data;
            this.vendorName   = d.vendorName;
            this.taxId        = d.taxId;
            this.avatarUrl    = d.profilePictureUrl  || null;
            this.doc1Url      = d.taxIdFrontImageUrl || null;
            this.doc2Url      = d.taxIdBackImageUrl  || null;
            this.workEmail    = d.workEmail;
            this.phoneNumber  = d.phoneNumber;
            this.country      = d.address?.country      ?? '';
            this.stateRegion  = d.address?.stateRegion  ?? '';
            this.city         = d.address?.city          ?? '';
            this.street       = d.address?.streetNumber  ?? '';
            this.fullAddress  = d.address?.fullAddress   ?? '';
            if (d.planType) this.plan = d.planType;

            if (d.bankAccount) {
              this.bankSvc.setLocal({
                legalName: d.bankAccount.accountHolderName,
                iban: d.bankAccount.iban,
                bankName: d.bankAccount.bankName,
                accountNumber: d.bankAccount.accountNumber,
              });
            } else {
              this.bankSvc.setLocal(null);
            }
          }
          this.cdr.markForCheck();
        });
      },
      error: (err: { name?: string }) => {
        this.zone.run(() => {
          this.loading      = false;
          this.errorMessage = err?.name === 'TimeoutError'
            ? 'The server is taking too long to respond. Please try again shortly.'
            : 'Failed to load profile data.';
          this.cdr.markForCheck();
        });
      }
    });
  }

  private fetchPlan(): void {
    // no-op: plan is now sourced from GET /api/VendorProfile/profile (see loadProfile)
  }

  onEditName(): void { this.editNameTemp = this.vendorName; this.isEditingName = true; }

  onSaveName(): void {
    const newName = this.editNameTemp.trim();
    if (!newName || this.nameSaving) { this.isEditingName = false; return; }
    this.nameSaving = true;
    this.nameError  = '';
    this.profileSvc.updateName(newName).subscribe({
      next: () => {
        this.zone.run(() => {
          this.nameSaving    = false;
          this.vendorName    = newName;
          this.isEditingName = false;
          this.cdr.markForCheck();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.nameSaving = false;
          this.nameError  = 'Failed to update name.';
          this.cdr.markForCheck();
        });
      }
    });
  }

  onCancelName(): void { this.isEditingName = false; }

  onAvatarClick(): void {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      this.avatarUploading = true;
      this.avatarError     = '';
      this.profileSvc.updatePicture(file).subscribe({
        next: (res: ApiResponse<unknown>) => {
          this.zone.run(() => {
            this.avatarUploading = false;
            const returnedUrl = (res?.data as { profilePictureUrl?: string })?.profilePictureUrl;
            if (typeof returnedUrl === 'string' && returnedUrl) {
              this.avatarUrl = returnedUrl;
              this.cdr.markForCheck();
            } else {
              const r = new FileReader();
              r.onload = (ev: ProgressEvent<FileReader>) => this.zone.run(() => {
                this.avatarUrl = ev.target?.result as string;
                this.cdr.markForCheck();
              });
              r.readAsDataURL(file);
            }
          });
        },
        error: () => {
          this.zone.run(() => {
            this.avatarUploading = false;
            this.avatarError     = 'Failed to update profile picture.';
            this.cdr.markForCheck();
          });
        }
      });
    };
    input.click();
  }

  onUploadDoc(slot: 1 | 2): void {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*,application/pdf';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return;
      const r = new FileReader();
      r.onload = (ev: ProgressEvent<FileReader>) => {
        if (slot === 1) this.doc1Url = ev.target?.result as string;
        else            this.doc2Url = ev.target?.result as string;
      };
      r.readAsDataURL(file);
    };
    input.click();
  }

  onAddBankAccount(): void { this.router.navigate(['/vendor-admin/bank-account']); }

  get bankAccount(): BankAccountInfo | null { return this.bankSvc.account; }

  get maskedAccount(): string {
    const acc = this.bankSvc.account?.accountNumber ?? '';
    if (acc.length <= 4) return acc;
    return '**** **** **** ' + acc.slice(-4);
  }

  toggleDropdown(event: Event): void { event.stopPropagation(); this.showDropdown = !this.showDropdown; }

  onViewDetails(): void { this.showDropdown = false; this.router.navigate(['/vendor-admin/bank-account'], { queryParams: { mode: 'view' } }); }

  onRemoveBankAccount(): void { this.bankSvc.remove(); this.showDropdown = false; }

  @HostListener('document:click')
  onDocClick(): void { this.showDropdown = false; }
}
