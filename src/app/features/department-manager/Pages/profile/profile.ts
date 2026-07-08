import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DepartmentProfileService,
  DepartmentProfileData,
  ApiResponse,
} from '../../../../core/services/department-manager/services/department-profile.service';

// المسار اللي بترجع منه صور البروفايل (نفس الدومين بتاع الـ API)
const IMAGES_BASE_URL = 'https://safka.runasp.net/images/';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly profileService = inject(DepartmentProfileService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // ---- page state ----
  isLoading = true;
  loadError = '';

  // ---- avatar ----
  avatarUrl: string | null = null;
  avatarUploading = false;
  avatarError = '';

  // ---- personal info (view state) ----
  firstName = '';
  lastName = '';
  phoneNumber = '';
  workEmail = '';
  title = '';

  // ---- company info ----
  companyName = '';
  companyEmail = '';
  companyPhone = '';
  country = '';
  stateRegion = '';
  city = '';
  street = '';
  fullAddress = '';

  // ---- edit mode (Personal Info only) ----
  isEditing = false;
  editFirstName = '';
  editLastName = '';
  editPhone = '';
  isSaving = false;
  saveError = '';
  saveSuccess = false;

  ngOnInit(): void {
    this.loadProfile();
  }

  // GET /api/Profile/profile
  loadProfile(): void {
    this.isLoading = true;
    this.loadError = '';

    this.profileService.getProfile().subscribe({
      next: (res: ApiResponse<DepartmentProfileData>) => {
        this.isLoading = false;

        if (res?.success && res.data) {
          const d = res.data;
          this.firstName = d.firstName ?? '';
          this.lastName = d.lastName ?? '';
          this.phoneNumber = d.phoneNumber ?? '';
          this.workEmail = d.workEmail ?? '';
          this.title = d.title ?? '';

          // لو الـ backend رجع رابط بدون اسم ملف (لسه محدش رفع صورة) نسيبها من غير صورة
          this.avatarUrl = d.profilePictureUrl && !d.profilePictureUrl.endsWith('/')
            ? d.profilePictureUrl
            : null;

          this.companyName = d.companyName ?? '';
          this.companyEmail = d.companyEmail ?? '';
          this.companyPhone = d.companyPhone ?? '';
          this.country = d.companyAddress?.country ?? '';
          this.stateRegion = d.companyAddress?.stateRegion ?? '';
          this.city = d.companyAddress?.city ?? '';
          this.street = d.companyAddress?.streetNumber ?? '';
          this.fullAddress = d.companyAddress?.fullAddress ?? '';
        } else {
          this.loadError = res?.message || 'Failed to load profile.';
        }

        // بنعمل detectChanges يدوي عشان التحديثات اللي جايه من الـ subscribe تظهر
        // من غير ما نحتاج نضغط تاني عشان الصفحة تتحدث بصريًا.
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.loadError = 'Failed to load profile. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }

  // ---- avatar upload ----
  onAvatarClick(): void {
    if (this.avatarUploading) return;
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  // POST /api/Profile/update-picture
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.avatarUploading = true;
    this.avatarError = '';

    this.profileService.updatePicture(file).subscribe({
      next: (res: ApiResponse<string>) => {
        this.avatarUploading = false;

        if (res?.success) {
          // الرد بيرجع اسم الملف بس (مثال: "79b8e65a-....png") مش رابط كامل
          const fileName = typeof res.message === 'string' ? res.message : '';
          this.avatarUrl = fileName ? `${IMAGES_BASE_URL}${fileName}` : this.avatarUrl;
        } else {
          this.avatarError = res?.message || 'Failed to update profile picture.';
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.avatarUploading = false;
        this.avatarError = 'Failed to update profile picture. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }

  // ---- edit personal info ----
  startEdit(): void {
    this.editFirstName = this.firstName;
    this.editLastName = this.lastName;
    this.editPhone = this.phoneNumber;
    this.isEditing = true;
    this.saveError = '';
    this.saveSuccess = false;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.saveError = '';
  }

  // POST /api/Profile/update-personal-info
  saveEdit(): void {
    if (this.isSaving) return;

    if (!this.editFirstName.trim() || !this.editLastName.trim() || !this.editPhone.trim()) {
      this.saveError = 'Please fill in all fields.';
      return;
    }

    this.isSaving = true;
    this.saveError = '';

    this.profileService
      .updatePersonalInfo({
        firstName: this.editFirstName.trim(),
        lastName: this.editLastName.trim(),
        phoneNumber: this.editPhone.trim(),
      })
      .subscribe({
        next: (res: ApiResponse<boolean>) => {
          this.isSaving = false;

          if (res?.success) {
            this.firstName = this.editFirstName.trim();
            this.lastName = this.editLastName.trim();
            this.phoneNumber = this.editPhone.trim();
            this.isEditing = false;
            this.saveSuccess = true;
            setTimeout(() => {
              this.saveSuccess = false;
              this.cdr.detectChanges();
            }, 3000);
          } else {
            this.saveError = res?.message || 'Failed to update profile.';
          }

          this.cdr.detectChanges();
        },
        error: () => {
          this.isSaving = false;
          this.saveError = 'Failed to update profile. Please try again.';
          this.cdr.detectChanges();
        },
      });
  }
}
