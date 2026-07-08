import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  InventoryProfileService,
  InventoryProfileData,
  ApiResponse,
} from '../../../core/services/inventory-officer/inventory-profile.service';

@Component({
  selector: 'app-inventory-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './inventory-profile.html',
  styleUrl: './inventory-profile.css',
})
export class InventoryProfile implements OnInit {
  profileForm!: FormGroup;

  isLoading      = false;
  isSaving       = false;
  errorMessage   = '';
  successMessage = '';

  avatarUrl:       string | null = null;
  avatarUploading  = false;
  avatarError      = '';

  constructor(
    private fb: FormBuilder,
    private profileService: InventoryProfileService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadUserData();
  }

  initializeForm(): void {
    this.profileForm = this.fb.group({
      firstName:    ['', Validators.required],
      lastName:     ['', Validators.required],
      phone:        ['', Validators.required],
      email:        [{ value: '', disabled: true }],
      title:        [{ value: '', disabled: true }],
      companyName:  [{ value: '', disabled: true }],
      companyEmail: [{ value: '', disabled: true }],
      companyPhone: [{ value: '', disabled: true }],
      country:      [{ value: '', disabled: true }],
      state:        [{ value: '', disabled: true }],
      city:         [{ value: '', disabled: true }],
      street:       [{ value: '', disabled: true }],
      fullAddress:  [{ value: '', disabled: true }],
    });
  }

  // GET /api/Profile/profile
  loadUserData(): void {
    this.isLoading    = true;
    this.errorMessage = '';

    this.profileService.getProfile().subscribe({
      next: (res: ApiResponse<InventoryProfileData>) => {
        this.isLoading = false;
        if (res?.success && res.data) {
          const d = res.data;
          this.avatarUrl = d.profilePictureUrl || null;
          this.profileForm.patchValue({
            firstName:    d.firstName,
            lastName:     d.lastName,
            phone:        d.phoneNumber,
            email:        d.workEmail,
            title:        d.title,
            companyName:  d.companyName,
            companyEmail: d.companyEmail,
            companyPhone: d.companyPhone,
            country:      d.companyAddress?.country      ?? '',
            state:        d.companyAddress?.stateRegion  ?? '',
            city:         d.companyAddress?.city          ?? '',
            street:       d.companyAddress?.streetNumber  ?? '',
            fullAddress:  d.companyAddress?.fullAddress   ?? '',
          });
        }
      },
      error: (err: { name?: string }) => {
        this.isLoading    = false;
        this.errorMessage = err?.name === 'TimeoutError'
          ? 'The server is taking too long to respond. Please try again shortly.'
          : 'Failed to load profile data.';
      },
    });
  }

  // POST /api/Profile/update-picture
  onAvatarClick(): void {
    if (this.avatarUploading) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      this.avatarUploading = true;
      this.avatarError     = '';
      this.profileService.updatePicture(file).subscribe({
        next: (res: ApiResponse<unknown>) => {
          this.avatarUploading = false;
          const returnedUrl = (res?.data as { profilePictureUrl?: string })?.profilePictureUrl;
          if (typeof returnedUrl === 'string' && returnedUrl) {
            this.avatarUrl = returnedUrl;
          } else {
            const r = new FileReader();
            r.onload = (ev: ProgressEvent<FileReader>) => {
              this.avatarUrl = ev.target?.result as string;
            };
            r.readAsDataURL(file);
          }
        },
        error: () => {
          this.avatarUploading = false;
          this.avatarError     = 'Failed to update profile picture.';
        },
      });
    };
    input.click();
  }

  // POST /api/Profile/update-personal-info
  onSubmit(): void {
    if (this.profileForm.invalid || this.isSaving) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.isSaving       = true;
    this.errorMessage   = '';
    this.successMessage = '';

    const { firstName, lastName, phone } = this.profileForm.getRawValue();
    this.profileService.updatePersonalInfo({ firstName, lastName, phoneNumber: phone }).subscribe({
      next: () => {
        this.isSaving       = false;
        this.successMessage = 'Profile updated successfully.';
      },
      error: () => {
        this.isSaving     = false;
        this.errorMessage = 'Failed to update profile.';
      },
    });
  }
}
