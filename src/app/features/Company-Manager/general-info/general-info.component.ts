import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-general-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './general-info.component.html',
  styleUrls: ['./general-info.component.css']
})
export class GeneralInfoComponent {

  /* ── company data ── */
  companyName  = 'Company Name';
  taxId        = 'Lorem Ipsum';
  workEmail    = 'Lorem Ipsum';
  phoneNumber  = 'Lorem Ipsum';

  location = {
    country: 'Lorem Ipsum',
    stateRegion: 'Lorem Ipsum',
    city: 'Lorem Ipsum',
    street: 'Lorem Ipsum',
    fullAddress: 'Lorem Ipsum',
  };

  /* ── dots menu ── */
  dotsMenuOpen = false;

  toggleDotsMenu(e: MouseEvent): void {
    e.stopPropagation();
    this.dotsMenuOpen = !this.dotsMenuOpen;
  }

  @HostListener('document:click')
  closeDotsMenu(): void { this.dotsMenuOpen = false; }

  /* ── Edit Location modal ── */
  showEditLocation = false;

  editForm = { country: '', stateRegion: '', city: '', street: '', fullAddress: '' };

  openEditLocation(): void {
    this.dotsMenuOpen = false;
    this.editForm = { ...this.location };
    this.showEditLocation = true;
  }

  closeEditLocation(): void { this.showEditLocation = false; }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.closeEditLocation();
  }

  saveLocation(): void {
    this.location = { ...this.editForm };
    this.closeEditLocation();
  }
}
