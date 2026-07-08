import { Component } from '@angular/core';
@Component({
  selector: 'app-company-budget',
  standalone: true,
  template: `
    <div class="placeholder-page">
      <div class="placeholder-card">
        <h2>Company Budget</h2>
        <p>هذه الصفحة قيد التطوير</p>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-page { display:flex; align-items:center; justify-content:center; height:100%; padding:40px; }
    .placeholder-card { background:#fff; border-radius:20px; padding:60px; text-align:center; box-shadow:0 2px 20px rgba(0,0,0,0.04); max-width:500px; width:100%; }
    h2 { font-size:22px; font-weight:700; color:#1A1A2E; margin-bottom:12px; }
    p  { color:#6B6B8A; font-size:15px; }
  `]
})
export class CompanyBudgetComponent {}
