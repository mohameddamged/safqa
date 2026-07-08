import { Component } from '@angular/core';

interface TrustedFeature {
  label: string;
  icon: string;
}

// أيقونات حقيقية من نظام Safqa نفسه (نفس الأيقونات المستخدمة في الـ Sidebar)
// بدل اللوجوهات الوهمية اللي كانت باسم شركات زي Cisco/Dell/Vodafone.
const FEATURES: TrustedFeature[] = [
  { label: 'Verified Vendors', icon: 'images/sidebar/verifications.png' },
  { label: 'RFQs & Tenders', icon: 'images/sidebar/RFQ.png' },
  { label: 'Companies', icon: 'images/sidebar/compaines.png' },
  { label: 'Categories', icon: 'images/sidebar/categories.png' },
  { label: 'Subscriptions', icon: 'images/sidebar/subscription.png' },
  { label: 'Vendor Network', icon: 'images/sidebar/vendor.png' },
  { label: 'Dashboard & Analytics', icon: 'images/sidebar/dashboard.png' },
  { label: '24/7 Support', icon: 'images/sidebar/support.png' },
];

@Component({
  selector: 'app-trusted',
  imports: [],
  templateUrl: './trusted.html',
  styleUrl: './trusted.css',
})
export class Trusted {
  features = FEATURES;
  // نفس الليستة بس بالعكس عشان السطر التاني يتحرك في الاتجاه المعاكس (تأثير "رايحة جايه")
  featuresReversed = [...FEATURES].reverse();
}
