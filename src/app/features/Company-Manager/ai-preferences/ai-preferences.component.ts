import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai-preferences',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-preferences.component.html',
  styleUrls: ['./ai-preferences.component.css']
})
export class AiPreferencesComponent {

  /* ── all available categories ── */
  allCategories: string[] = [
    'Copiers & toners', 'Office Supplies', 'IT Equipment', 'Furniture',
    'Cleaning Supplies', 'Safety Equipment', 'Medical Supplies', 'Food & Beverages',
    'Construction Materials', 'Electrical Equipment', 'Plumbing Supplies', 'Vehicles',
    'Uniforms & Apparel', 'Packaging Materials', 'Laboratory Equipment', 'Software & Licenses',
  ];

  /* ── selected categories (confirmed) ── */
  selectedCategories: string[] = [];

  /* ── modal state ── */
  showModal    = false;
  searchQuery  = '';

  /* temp selections inside modal — copied from selectedCategories on open */
  tempSelected: string[] = [];

  get filteredCategories(): string[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.allCategories;
    return this.allCategories.filter(c => c.toLowerCase().includes(q));
  }

  openModal(): void {
    this.tempSelected = [...this.selectedCategories];
    this.searchQuery  = '';
    this.showModal    = true;
  }

  closeModal(): void {
    this.showModal   = false;
    this.searchQuery = '';
  }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.closeModal();
  }

  isTemp(cat: string): boolean {
    return this.tempSelected.includes(cat);
  }

  toggleTemp(cat: string): void {
    const idx = this.tempSelected.indexOf(cat);
    if (idx === -1) this.tempSelected.push(cat);
    else            this.tempSelected.splice(idx, 1);
  }

  removeTempTag(cat: string): void {
    this.tempSelected = this.tempSelected.filter(c => c !== cat);
  }

  confirm(): void {
    this.selectedCategories = [...this.tempSelected];
    this.closeModal();
  }

  removeConfirmed(cat: string): void {
    this.selectedCategories = this.selectedCategories.filter(c => c !== cat);
  }
}
