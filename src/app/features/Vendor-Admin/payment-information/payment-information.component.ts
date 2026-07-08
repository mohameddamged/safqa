import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-information',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-information.component.html',
  styleUrls: ['./payment-information.component.css']
})
export class PaymentInformationComponent {

  planName     = 'Pro Plan';
  planSubtitle = 'Monthly Subscription';
  planPrice    = 1000;
  tax          = 0;

  get subtotal(): number { return this.planPrice; }
  get estimatedTotal(): number { return this.planPrice + this.tax; }

  constructor(private router: Router) {}

  onAddCreditCard(): void {
    // Future: navigate to credit card form
  }
}
