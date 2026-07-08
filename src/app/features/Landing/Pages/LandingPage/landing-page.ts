import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Hero } from './components/hero/hero';
import { Joinus } from './components/joinus/joinus';
import { HowItWorks } from './components/how-it-works/how-it-works';
import { FAQ } from './components/faq/faq';
import { PricingCta } from './components/pricing-cta/pricing-cta';
import { Trusted } from './components/trusted/trusted';
import { Procurement } from './components/procurement/procurement';
import { Header } from '../Shared/Components/header/header';
import { Footer } from '../Shared/Components/footer/footer';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    FAQ,
    Header,
    Footer,
    Hero,
    HowItWorks,
    Joinus,
    PricingCta,
    Procurement,
    Trusted,
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPageComponent {}