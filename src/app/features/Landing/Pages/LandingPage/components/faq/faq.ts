import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
})
export class FAQ {
  activeFaqIndex: number | null = null;

  faqs = [
    {
      question: 'What is Safqa and who is it for?',
      answer: 'Safqa is an all-in-one procurement platform built for companies and vendors who want to source, negotiate, and close deals in one secure workspace. It fits buyers looking for verified suppliers and vendors looking to grow their customer network.'
    },
    {
      question: 'How does the AI agent work in the platform?',
      answer: 'Our AI agent reviews your sourcing activity and spending patterns to surface smarter recommendations, helping buyers optimize budgets and helping vendors target the right opportunities at the right time.'
    },
    {
      question: 'Can multiple team members use the same company account?',
      answer: 'Yes. A company account supports multiple team members with shared visibility into RFQs, tenders, and negotiations, so your whole procurement team stays aligned.'
    },
    {
      question: 'Are there any hidden fees or commissions for suppliers?',
      answer: 'No. Safqa offers 0% commission options for vendors, with transparent pricing plans so suppliers always know exactly what they are paying for.'
    },
    {
      question: 'How are companies and suppliers verified on Safqa?',
      answer: 'Every company and supplier goes through a document verification process before they can post or bid on requests, keeping the marketplace trustworthy for both buyers and sellers.'
    }
  ];

  toggleFaq(index: number): void {
    this.activeFaqIndex = this.activeFaqIndex === index ? null : index;
  }
}