import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PoService } from '../../../../core/services/inventory-officer/poservice';
import { PoField } from '../../shared/po-field/po-field';

@Component({
  selector: 'app-po-details',
  imports: [PoField, RouterLink, DatePipe],
  templateUrl: './po-details.html',
  styleUrl: './po-details.css',
})
export class PoDetails implements OnInit {
  poData = signal<any>(null);
  isLoading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private poService: PoService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPoDetails(id);
    }
  }

  loadPoDetails(id: string) {
    this.isLoading.set(true);
    this.poService.getPoById(id).subscribe({
      next: (res) => {
        this.poData.set(res?.data ?? null);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}
