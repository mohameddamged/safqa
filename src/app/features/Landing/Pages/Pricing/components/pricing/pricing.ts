import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../../Shared/Components/header/header';
import { Footer } from '../../../Shared/Components/footer/footer';
import { RouterLink } from '@angular/router';

interface Plan {
  badge: string;          
  badgeColor: string;    
  badgeBg: string;       
  name: string;          
  price: string;         
  period: string;        
  description: string;
  features: string[];
  isPro: boolean;          
}
interface RolePlans {
  free: Plan;
  pro: Plan;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, Header, Footer, RouterLink],
  templateUrl: './pricing.html',
  styleUrl: './pricing.css',
})
export class Pricing {

  activeRole: 'companies' | 'vendors' = 'companies';

  pricingPlans: { companies: RolePlans; vendors: RolePlans } = {
    companies: {
      free: {
        badge: 'Default',
        badgeColor: '#25B6AB',
        badgeBg: '#E7F7F5',
        name: 'Free Plan',
        price: '$0',
        period: '/month',
        description: 'Perfect for small businesses to start saving on procurement.',
        features: [
          '2 RFQs you can send per week.',
          'Basic AI-powered RFQ summary.'
        ],
        isPro: false
      },
      pro: {
        badge: 'Popular',
        badgeColor: '#E87AED',
        badgeBg: '#FBEAFC',
        name: 'Pro Plan',
        price: '$89',
        period: '/month',
        description: 'Complete procurement control for high-volume corporate sourcing.',
        features: [
          'Unlimited RFQs.',
          'Advanced AI Agent (predictive insights & discount alerts).'
        ],
        isPro: true
      }
    },
    vendors: {
      free: {
        badge: 'Default',
        badgeColor: '#25B6AB',
        badgeBg: '#E7F7F5',
        name: 'Free Plan',
        price: '$0',
        period: '/month',
        description: 'Start receiving corporate requests and expand your client network.',
        features: [
          'Reply to 1 RFQ per day.',
          'Submit 1 tender bid per week.',
          'Standard visibility in buyer RFQ recommendations.'
        ],
        isPro: false
      },
      pro: {
        badge: 'Popular',
        badgeColor: '#E87AED',
        badgeBg: '#FBEAFC',
        name: 'Pro Plan',
        price: '$149',
        period: '/month',
        description: 'Dominate the supply market with zero hidden commissions.',
        features: [
          'Unlimited RFQ replies.',
          'Priority AI ranking in buyer searches.',
          'Advanced profile & visitor analytics.'
        ],
        isPro: true
      }
    }
  };

  setActiveRole(role: 'companies' | 'vendors'): void {
    this.activeRole = role;
  }

  goBack(): void {
    window.history.back();
  }

}