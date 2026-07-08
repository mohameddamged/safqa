// import { Component, inject, OnInit, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { CompanyProfileService } from '../../../core/services/Company-Manager/CompanyProfile/company-profile-service';

// @Component({
//   selector: 'app-company-info',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './company-info.html'
// })
// export class CompanyInfo implements OnInit {

//   private profileService = inject(CompanyProfileService);

//   profileData = signal<any>(null);
//   isLoading = signal(true);

//   ngOnInit(): void {
//     this.loadCompanyProfile();
//   }

//   loadCompanyProfile(): void {
//     this.profileService.getProfile().subscribe({
//       next: (res) => {
//         if (res.success) {
//           this.profileData.set(res.data);
//         }
//         this.isLoading.set(false);
//       },
//       error: () => this.isLoading.set(false)
//     });
//   }

//   getLastFourDigits(accountNumber: string): string {
//     return accountNumber?.slice(-4) ?? '';
//   }
// }

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyProfileService } from '../../../core/services/Company-Manager/CompanyProfile/company-profile-service';
import { PaymentService } from '../../../core/services/Vendor-Admin/payment.service';

@Component({
  selector: 'app-company-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-info.html'
})
export class CompanyInfo implements OnInit {

  private profileService = inject(CompanyProfileService);
  private paymentService = inject(PaymentService);

  profileData = signal<any>(null);
  isLoading = signal(true);
  isPaymentLoading = signal(false);

  ngOnInit(): void {
    this.loadCompanyProfile();
  }

  loadCompanyProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (res) => {
        if (res.success) {
          this.profileData.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getLastFourDigits(accountNumber: string): string {
    return accountNumber?.slice(-4) ?? '';
  }

  onCheckout(): void {
    if (this.isPaymentLoading()) return;

    this.isPaymentLoading.set(true);

    this.paymentService.checkout(2).subscribe({
      next: (res) => {
        this.isPaymentLoading.set(false);
        const paymentUrl =
          typeof res === 'string' ? res : (res?.data?.paymentUrl ?? res?.data?.url ?? res?.paymentUrl ?? res?.url);

        if (paymentUrl) {
          window.open(paymentUrl, '_blank');
        }
      },
      error: () => {
        this.isPaymentLoading.set(false);
      }
    });
  }
}


