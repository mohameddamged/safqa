import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../core/services/Vendor-Admin/payment.service';
import { ToastService } from '../../../core/services/Vendor-Admin/toast.service';

export interface SavedCard {
  last4: string;
}

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css']
})
export class SubscriptionComponent {
  /** Controls which view is shown */
  view: 'plans' | 'payment' | 'addCard' | 'myPlan' = 'plans';

  /** Cards the user has saved so far */
  savedCards: SavedCard[] = [];

  /** Index of the card currently selected for payment (null = none selected) */
  selectedCardIndex: number | null = null;

  /** Index of the saved card whose "..." menu is open (null = none open) */
  openMenuIndex: number | null = null;

  /** Whether the "Successful Payment" confirmation modal is showing */
  showSuccessModal = false;

  /** Whether the "Cancel Subscription" confirmation modal is showing */
  showCancelConfirmModal = false;

  /** Whether a payment API call is in-flight */
  isPaymentLoading = false;

  /** Whether a cancel API call is in-flight */
  isCancelLoading = false;

  /** Card form model */
  cardNumber = '4111 1111 1111 1111';
  cardName = '';
  cardExpiry = ''; // stored as "YYYY-MM" (native month input value)
  cardCode = '';

  /** Max characters allowed for the cardholder name */
  readonly nameMaxLength = 26;

  /** Minimum value for the expiry month-picker = current month (no past dates) */
  readonly minExpiry = this.getCurrentMonthValue();

  /** Whether the live card preview is showing its back face (while typing CVC) */
  isCardFlipped = false;

  /** Validation error messages, keyed by field */
  errors: { cardNumber?: string; cardName?: string; cardExpiry?: string; cardCode?: string } = {};

  /** Tracks which fields the user has already left, so errors don't show before they try */
  touched: { cardNumber?: boolean; cardName?: boolean; cardExpiry?: boolean; cardCode?: boolean } = {};

  constructor(
    private paymentService: PaymentService,
    private toast: ToastService
  ) {}

  onSubscribe(): void {
    this.view = 'payment';
  }

  onAddCard(): void {
    this.view = 'addCard';
  }

  onBackToPayment(): void {
    this.view = 'payment';
  }

  onSaveCard(): void {
    this.touched = { cardNumber: true, cardName: true, cardExpiry: true, cardCode: true };
    this.validateAll();

    const hasErrors = Object.values(this.errors).some(msg => !!msg);
    if (hasErrors) {
      return;
    }

    const digits = this.cardNumber.replace(/\D/g, '');
    this.savedCards.push({ last4: digits.slice(-4) });
    this.selectedCardIndex = this.savedCards.length - 1;

    // Reset the form so a future "Add Another Card" starts clean
    this.cardName = '';
    this.cardExpiry = '';
    this.cardCode = '';
    this.errors = {};
    this.touched = {};

    this.view = 'payment';
  }

  /** Selects a saved card as the one to pay with */
  onSelectCard(index: number): void {
    this.selectedCardIndex = index;
  }

  /** Opens/closes the "..." menu for a saved card row */
  onToggleCardMenu(index: number, event: Event): void {
    event.stopPropagation();
    this.openMenuIndex = this.openMenuIndex === index ? null : index;
  }

  /** Removes a saved card */
  onRemoveCard(index: number, event: Event): void {
    event.stopPropagation();
    this.savedCards.splice(index, 1);
    this.openMenuIndex = null;

    if (this.selectedCardIndex === index) {
      this.selectedCardIndex = null;
    } else if (this.selectedCardIndex !== null && this.selectedCardIndex > index) {
      this.selectedCardIndex--;
    }
  }

  /** Confirms payment with the selected card — calls POST /api/Payment/checkout and opens the Paymob payment page */
  onPay(): void {
    if (this.selectedCardIndex === null || this.isPaymentLoading) {
      return;
    }

    this.isPaymentLoading = true;

    // plan 2 = Premium/Pro subscription
    this.paymentService.checkout(2).subscribe({
      next: (res) => {
        this.isPaymentLoading = false;
        const paymentUrl =
          typeof res === 'string' ? res : (res?.data?.paymentUrl ?? res?.data?.url ?? res?.paymentUrl ?? res?.url);

        if (paymentUrl) {
          window.open(paymentUrl, '_blank');
        } else {
          this.toast.error('Payment link was not returned by the server.', 'Payment Failed');
        }
      },
      error: (err) => {
        this.isPaymentLoading = false;
        const message =
          err?.error?.message || err?.message || 'Payment failed. Please try again.';
        this.toast.error(message, 'Payment Failed');
      }
    });
  }

  /** Closes the success modal after a successful payment */
  onCloseSuccessModal(): void {
    this.showSuccessModal = false;
    this.view = 'myPlan';
  }

  /** Opens the cancel-subscription confirmation modal */
  onCancelSubscription(): void {
    this.showCancelConfirmModal = true;
  }

  /** Closes the cancel confirmation modal without doing anything */
  onDismissCancelModal(): void {
    this.showCancelConfirmModal = false;
  }

  /** Confirmed by user — calls POST /api/Payment/cancel-subscription */
  onConfirmCancel(): void {
    if (this.isCancelLoading) return;

    this.isCancelLoading = true;

    this.paymentService.cancelSubscription().subscribe({
      next: () => {
        this.isCancelLoading = false;
        this.showCancelConfirmModal = false;

        // Reset state and go back to plans
        this.savedCards = [];
        this.selectedCardIndex = null;
        this.view = 'plans';

        this.toast.success(
          'Your subscription has been cancelled successfully.',
          'Subscription Cancelled'
        );
      },
      error: (err) => {
        this.isCancelLoading = false;
        const message =
          err?.error?.message || err?.message || 'Could not cancel subscription. Please try again.';
        this.toast.error(message, 'Cancellation Failed');
      }
    });
  }

  /** Add another card from the My Plan page */
  onAddAnotherCardFromPlan(): void {
    this.view = 'addCard';
  }

  /** Auto-inserts a space every 4 digits and caps the input at 16 digits (19 chars incl. spaces) */
  onCardNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '').slice(0, 16);
    const groups = digitsOnly.match(/.{1,4}/g) || [];
    this.cardNumber = groups.join(' ');
    input.value = this.cardNumber;
    this.validateCardNumber();
  }

  /** English letters and spaces only, capped at nameMaxLength */
  onCardNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const lettersOnly = input.value.replace(/[^A-Za-z\s]/g, '').slice(0, this.nameMaxLength);
    this.cardName = lettersOnly;
    input.value = this.cardName;
    this.validateCardName();
  }

  onExpiryChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.cardExpiry = input.value;
    this.validateExpiry();
  }

  /** Caps CVC at 4 digits, numeric only */
  onCardCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.cardCode = input.value.replace(/\D/g, '').slice(0, 4);
    input.value = this.cardCode;
    this.validateCardCode();
  }

  onCodeFocus(): void {
    this.isCardFlipped = true;
  }

  onCodeBlur(): void {
    this.isCardFlipped = false;
    this.touched.cardCode = true;
    this.validateCardCode();
  }

  onFieldBlur(field: 'cardNumber' | 'cardName' | 'cardExpiry'): void {
    this.touched[field] = true;
    if (field === 'cardNumber') this.validateCardNumber();
    if (field === 'cardName') this.validateCardName();
    if (field === 'cardExpiry') this.validateExpiry();
  }

  /* ───────── Validation helpers ───────── */

  private validateAll(): void {
    this.validateCardNumber();
    this.validateCardName();
    this.validateExpiry();
    this.validateCardCode();
  }

  private validateCardNumber(): void {
    const digits = this.cardNumber.replace(/\D/g, '');
    if (!digits) {
      this.errors.cardNumber = 'Card number is required.';
    } else if (digits.length < 16) {
      this.errors.cardNumber = 'Card number must be 16 digits.';
    } else {
      this.errors.cardNumber = undefined;
    }
  }

  private validateCardName(): void {
    const name = this.cardName.trim();
    if (!name) {
      this.errors.cardName = 'Cardholder name is required.';
    } else if (name.length < 3) {
      this.errors.cardName = 'Name is too short.';
    } else if (!/^[A-Za-z\s]+$/.test(name)) {
      this.errors.cardName = 'Name must be in English letters only.';
    } else {
      this.errors.cardName = undefined;
    }
  }

  private validateExpiry(): void {
    if (!this.cardExpiry) {
      this.errors.cardExpiry = 'Expiry date is required.';
      return;
    }
    if (this.cardExpiry < this.minExpiry) {
      this.errors.cardExpiry = 'Card has expired.';
      return;
    }
    this.errors.cardExpiry = undefined;
  }

  private validateCardCode(): void {
    if (!this.cardCode) {
      this.errors.cardCode = 'Security code is required.';
    } else if (this.cardCode.length < 3) {
      this.errors.cardCode = 'Code must be 3 or 4 digits.';
    } else {
      this.errors.cardCode = undefined;
    }
  }

  private getCurrentMonthValue(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /* ───────── Live card preview getters ───────── */

  get displayCardNumber(): string {
    const digits = this.cardNumber.replace(/\D/g, '').padEnd(16, '•').slice(0, 16);
    const groups = digits.match(/.{1,4}/g) || [];
    return groups.join('  ');
  }

  get displayCardName(): string {
    return this.cardName.trim() ? this.cardName.toUpperCase() : 'CARDHOLDER NAME';
  }

  get displayCardExpiry(): string {
    if (!this.cardExpiry) return '12/25';
    const [year, month] = this.cardExpiry.split('-');
    return `${month}/${year.slice(2)}`;
  }

  get displayCardCode(): string {
    return this.cardCode.trim() ? this.cardCode.padEnd(3, '•') : '•••';
  }

  /** Formatted current date for display in My Plan */
  get currentDate(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
