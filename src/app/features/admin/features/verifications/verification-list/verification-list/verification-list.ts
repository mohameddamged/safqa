import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VerificationService } from '../../../../core/services/verification-service';
import { pipe } from 'rxjs';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-verification-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './verification-list.html'
})
export class VerificationListComponent implements OnInit {
  type: 'companies' | 'vendors' = 'companies';
  items = signal<any[]>([]);
  loading = signal<boolean>(true);
  error: WritableSignal<string | null> = signal(null);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1); 
  selectedStatus = '';
  isFilterOpen = false;

  constructor(
    private route: ActivatedRoute,
    private verificationService: VerificationService,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.url.subscribe(urlSegments => {
      this.type = urlSegments[1].path as 'companies' | 'vendors';
      this.currentPage.set(1); 
      this.loadData();
    });
  }

  loadData(page: number = 1) {
    this.loading.set(true);
    this.error.set(null);
    this.currentPage.set(page); 

    this.verificationService.getPending(this.type, page).subscribe({
      next: (res) => {
        if (res.success) {
          this.items.set(res.data.items);
          this.totalPages.set(res.data.totalPages || 1);
        } else {
          this.error.set(res.message || 'error');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('cannot connect to server');
        this.loading.set(false);
      }
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.loadData(page);
    }
  }
}