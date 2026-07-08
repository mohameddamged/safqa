import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BankAccountService } from '../../../core/services/Vendor-Admin/bank-account.service';


@Component({
  selector: 'app-bank-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bank-account.component.html',
  styleUrls: ['./bank-account.component.css']
})
export class BankAccountComponent implements OnInit {

  legalName       = '';
  iban            = '';
  bankName        = '';
  accountNumber   = '';
  reAccountNumber = '';

  showSuccess = false;
  submitted   = false;
  isSaving    = false;
  saveError   = '';

  /** True when opened via "View Details" on an existing account — fields become read-only. */
  viewMode = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bankSvc: BankAccountService
  ) {}

  ngOnInit(): void {
    this.viewMode = this.route.snapshot.queryParamMap.get('mode') === 'view';

    if (this.viewMode && this.bankSvc.account) {
      const acc = this.bankSvc.account;
      this.legalName = acc.legalName;
      this.iban = acc.iban;
      this.bankName = acc.bankName;
      this.accountNumber = acc.accountNumber;
      this.reAccountNumber = acc.accountNumber;
    }
  }

  /* ── Validation helpers ── */
  get legalNameError(): string {
    if (!this.submitted) return '';
    if (!this.legalName.trim()) return 'Legal name is required.';
    if (this.legalName.trim().length < 3) return 'Name must be at least 3 characters.';
    if (/\d/.test(this.legalName)) return 'Name must not contain numbers.';
    return '';
  }

  get ibanError(): string {
    if (!this.submitted) return '';
    const clean = this.iban.replace(/\s/g, '').toUpperCase();
    if (!clean) return 'IBAN is required.';
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(clean)) return 'Invalid IBAN format (e.g. EG380019000500000000263180002).';
    return '';
  }

  get bankNameError(): string {
    if (!this.submitted) return '';
    if (!this.bankName.trim()) return 'Bank name is required.';
    if (this.bankName.trim().length < 2) return 'Enter a valid bank name.';
    return '';
  }

  get accountNumberError(): string {
    if (!this.submitted) return '';
    if (!this.accountNumber) return 'Account number is required.';
    if (!/^\d+$/.test(this.accountNumber)) return 'Account number must contain digits only.';
    if (this.accountNumber.length < 6) return 'Account number must be at least 6 digits.';
    if (this.accountNumber.length > 20) return 'Account number is too long.';
    return '';
  }

  get reAccountNumberError(): string {
    if (!this.submitted) return '';
    if (!this.reAccountNumber) return 'Please re-enter the account number.';
    if (this.reAccountNumber !== this.accountNumber) return 'Account numbers do not match.';
    return '';
  }

  get isFormValid(): boolean {
    return !this.legalNameError && !this.ibanError && !this.bankNameError &&
           !this.accountNumberError && !this.reAccountNumberError &&
           !!this.legalName && !!this.iban && !!this.bankName &&
           !!this.accountNumber && !!this.reAccountNumber;
  }

  /* Allow only digits in account number fields */
  onAccountNumberInput(event: Event, field: 'accountNumber' | 'reAccountNumber'): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '');
    input.value = digitsOnly;
    this[field] = digitsOnly;
  }

  /* Allow only alphanumeric + spaces for IBAN */
  onIbanInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const clean = input.value.replace(/[^A-Za-z0-9\s]/g, '').toUpperCase();
    input.value = clean;
    this.iban = clean;
  }

  onSave(): void {
    this.submitted = true;
    if (!this.isFormValid || this.isSaving) return;

    this.isSaving = true;
    this.saveError = '';

    this.bankSvc.saveToApi({
      legalName: this.legalName.trim(),
      iban: this.iban.replace(/\s/g, '').toUpperCase(),
      bankName: this.bankName.trim(),
      accountNumber: this.accountNumber,
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.showSuccess = true;
      },
      error: (err) => {
        this.isSaving = false;
        this.saveError = err?.error?.message || err?.message || 'Failed to save bank account info.';
      }
    });
  }

  onOk(): void {
    this.showSuccess = false;
    this.router.navigate(['/vendor-admin/vendor-profile']);
  }
}
