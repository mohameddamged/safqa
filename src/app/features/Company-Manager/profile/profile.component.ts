import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);

  firstName   = '';
  lastName    = '';
  phoneNumber = '';
  workEmail   = '';
  title       = '';

  ngOnInit(): void {
    const u = this.authService.currentUser();
    if (u) {
      this.firstName   = u.firstName ?? '';
      this.lastName    = u.lastName ?? '';
      this.phoneNumber = u.phoneNumber ?? '';
      this.workEmail   = u.email ?? '';
      this.title       = u.role ?? '';
    }
  }
}
